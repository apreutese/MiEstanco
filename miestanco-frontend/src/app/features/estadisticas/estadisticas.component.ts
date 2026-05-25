import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';
import { Maquina } from '../../core/models/models';

export interface TopProducto {
  productoId: number;
  nombre: string;
  cantidadVendida: number;
}

export interface MaquinaInactiva {
  maquinaId: number;
  nombre: string;
  barNombre: string;
  diasInactiva: number;
}

export interface EstadisticasDto {
  ingresosTotales: number;
  monedasEnviadasValor: number;
  totalPedidos: number;
  topProductos: TopProducto[];
  maquinasInactivas: MaquinaInactiva[];
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DecimalPipe, MatIconModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent implements OnInit {
  private api = inject(ApiService);

  stats = signal<EstadisticasDto | null>(null);
  loading = signal(true);
  
  maquinas = signal<Maquina[]>([]);
  
  // Filtros
  rangoTiempo = signal<string>('MES'); // HOY, SEMANA, MES, ANO, TODO
  maquinaId = signal<number | ''>('');
  
  // Pestañas UI
  activeTab = signal<'PRODUCTOS' | 'ALERTAS'>('PRODUCTOS');

  ngOnInit() {
    this.cargarMaquinas();
    this.cargarEstadisticas();
  }

  cargarMaquinas() {
    this.api.get<Maquina[]>('maquinas').subscribe(res => {
      this.maquinas.set(res.filter(m => m.activa));
    });
  }

  cargarEstadisticas() {
    this.loading.set(true);
    let params: Record<string, string | number> = { rangoTiempo: this.rangoTiempo() };
    if (this.maquinaId() !== '') {
      params['maquinaId'] = this.maquinaId();
    }

    this.api.get<EstadisticasDto>('estadisticas', params).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  cambiarRango(evt: Event) {
    const val = (evt.target as HTMLSelectElement).value;
    this.rangoTiempo.set(val);
    this.cargarEstadisticas();
  }

  cambiarMaquina(evt: Event) {
    const val = (evt.target as HTMLSelectElement).value;
    this.maquinaId.set(val === '' ? '' : +val);
    this.cargarEstadisticas();
  }
}
