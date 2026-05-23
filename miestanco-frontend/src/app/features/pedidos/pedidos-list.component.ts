import {
  Component, signal, computed, inject, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PedidoService } from './pedido.service';
import { AuthService } from '../../core/services/auth.service';
import { Pedido, EstadoPedido } from '../../core/models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, FormsModule, DatePipe,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './pedidos-list.component.html',
  styleUrl: './pedidos-list.component.scss'
})
export class PedidosListComponent implements OnInit {
  private svc = inject(PedidoService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  readonly isAdmin = this.auth.isAdmin;

  pedidos = signal<Pedido[]>([]);
  loading = signal(true);
  busqueda = signal('');

  readonly pedidosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase();
    return this.pedidos().filter(p =>
      !q ||
      p.maquina.bar.nombre.toLowerCase().includes(q) ||
      p.maquina.nombre.toLowerCase().includes(q) ||
      p.id.toString().includes(q)
    );
  });

  readonly EstadoPedido = EstadoPedido;

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.svc.listarActivos().subscribe({
      next: p => { this.pedidos.set(p ?? []); this.loading.set(false); },
      error: (err) => {
        console.error('Error cargando pedidos:', err);
        this.loading.set(false);
        const msg = err?.error?.mensaje || err?.message || 'Error al cargar pedidos';
        this.snack.open(msg, '', { duration: 4000 });
      }
    });
  }

  cambiarEstado(pedido: Pedido, estado: EstadoPedido) {
    this.svc.cambiarEstado(pedido.id, estado).subscribe({
      next: updated => {
        this.pedidos.update(list => list.map(p => p.id === updated.id ? updated : p)
          .filter(p => p.estado !== EstadoPedido.ENTREGADO && p.estado !== EstadoPedido.CANCELADO));
        this.snack.open('Estado actualizado', '', { duration: 2000 });
      },
      error: (err) => this.snack.open(err.error?.mensaje || 'Error', '', { duration: 3000 })
    });
  }

  cancelar(pedido: Pedido) {
    if (!confirm(`¿Cancelar pedido #${pedido.id}?`)) return;
    this.svc.cancelar(pedido.id).subscribe({
      next: () => {
        this.pedidos.update(list => list.filter(p => p.id !== pedido.id));
        this.snack.open('Pedido cancelado', '', { duration: 2000 });
      }
    });
  }

  estadoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación',
      PREPARADO: 'Preparado', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
    };
    return labels[estado];
  }

  siguienteEstado(estado: EstadoPedido): EstadoPedido | null {
    const flujo: Partial<Record<EstadoPedido, EstadoPedido>> = {
      [EstadoPedido.PENDIENTE]: EstadoPedido.EN_PREPARACION,
      [EstadoPedido.EN_PREPARACION]: EstadoPedido.PREPARADO,
      [EstadoPedido.PREPARADO]: EstadoPedido.ENTREGADO,
    };
    return flujo[estado] ?? null;
  }

  accionLabel(estado: EstadoPedido): string {
    const labels: Partial<Record<EstadoPedido, string>> = {
      PENDIENTE: 'Iniciar preparación', EN_PREPARACION: 'Marcar preparado', PREPARADO: 'Entregar'
    };
    return labels[estado] ?? '';
  }
}
