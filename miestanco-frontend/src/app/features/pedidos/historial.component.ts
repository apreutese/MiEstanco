import {
  Component, signal, computed, inject, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PedidoService } from './pedido.service';
import { Pedido, EstadoPedido, Maquina } from '../../core/models/models';

@Component({
  selector: 'app-historial',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, FormsModule, DatePipe,
    MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss'
})
export class HistorialComponent implements OnInit {
  private svc = inject(PedidoService);

  pedidos = signal<Pedido[]>([]);
  maquinas = signal<Maquina[]>([]);
  loading = signal(true);

  // Filtros
  filtroEstado = signal<EstadoPedido | ''>('');
  filtroMaquina = signal<number | ''>('');
  filtroBusqueda = signal('');

  readonly EstadoPedido = EstadoPedido;

  readonly estados = [
    { value: EstadoPedido.ENTREGADO, label: 'Entregado' },
    { value: EstadoPedido.CANCELADO, label: 'Cancelado' },
    { value: EstadoPedido.PREPARADO, label: 'Preparado' },
  ];

  readonly pedidosFiltrados = computed(() => {
    const q = this.filtroBusqueda().toLowerCase();
    return this.pedidos().filter(p => {
      if (q && !p.maquina.bar.nombre.toLowerCase().includes(q) &&
              !p.maquina.nombre.toLowerCase().includes(q) &&
              !String(p.id).includes(q)) return false;
      return true;
    });
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    const params: any = {};
    if (this.filtroEstado()) params.estado = this.filtroEstado();
    if (this.filtroMaquina()) params.maquinaId = this.filtroMaquina();

    this.svc.historial(params).subscribe({
      next: p => { this.pedidos.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  estadoLabel(estado: EstadoPedido): string {
    const l: Record<EstadoPedido, string> = {
      PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación',
      PREPARADO: 'Preparado', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
    };
    return l[estado];
  }
}
