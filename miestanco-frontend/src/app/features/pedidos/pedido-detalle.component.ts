import {
  Component, signal, computed, inject, OnInit, ChangeDetectionStrategy, input
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PedidoService } from './pedido.service';
import { AuthService } from '../../core/services/auth.service';
import { Pedido, EstadoPedido, LineaProducto, LineaMoneda } from '../../core/models/models';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, DatePipe, DecimalPipe,
    MatIconModule, MatButtonModule, MatSnackBarModule, MatProgressBarModule
  ],
  templateUrl: './pedido-detalle.component.html',
  styleUrl: './pedido-detalle.component.scss'
})
export class PedidoDetalleComponent implements OnInit {
  // Input desde la ruta (withComponentInputBinding)
  id = input.required<string>();

  private svc = inject(PedidoService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  readonly isAdmin = this.auth.isAdmin;
  readonly EstadoPedido = EstadoPedido;

  pedido = signal<Pedido | null>(null);
  loading = signal(true);
  guardando = signal(false);

  readonly progreso = computed(() => {
    const p = this.pedido();
    if (!p) return 0;
    const total = p.lineasProducto.length + p.lineasMoneda.length;
    if (!total) return 0;
    const preparados = p.lineasProducto.filter(l => l.preparada).length
                     + p.lineasMoneda.filter(l => l.preparada).length;
    return Math.round(preparados / total * 100);
  });

  readonly todoPreparado = computed(() => this.progreso() === 100);

  ngOnInit() {
    this.svc.obtener(+this.id()).subscribe({
      next: p => { this.pedido.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/pedidos']); }
    });
  }

  marcarProducto(linea: LineaProducto, checked: boolean) {
    this.svc.marcarItemProducto(this.pedido()!.id, linea.id, checked).subscribe({
      next: p => this.pedido.set(p)
    });
  }

  marcarMoneda(linea: LineaMoneda, checked: boolean) {
    this.svc.marcarItemMoneda(this.pedido()!.id, linea.id, checked).subscribe({
      next: p => this.pedido.set(p)
    });
  }

  cambiarEstado(estado: EstadoPedido) {
    this.guardando.set(true);
    this.svc.cambiarEstado(this.pedido()!.id, estado).subscribe({
      next: p => {
        this.pedido.set(p);
        this.guardando.set(false);
        this.snack.open('Estado actualizado', '', { duration: 2000 });
        if (estado === EstadoPedido.ENTREGADO) {
          setTimeout(() => this.router.navigate(['/pedidos']), 1500);
        }
      },
      error: (err) => {
        this.guardando.set(false);
        this.snack.open(err.error?.mensaje || 'Error', '', { duration: 3000 });
      }
    });
  }

  estadoLabel(estado: EstadoPedido): string {
    const l: Record<EstadoPedido, string> = {
      PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación',
      PREPARADO: 'Preparado', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
    };
    return l[estado];
  }

  totalProductos(): number {
    return this.pedido()?.lineasProducto.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0) ?? 0;
  }
}
