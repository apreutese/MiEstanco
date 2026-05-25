import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, EffectRef, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';
import { Maquina } from '../../core/models/models';

export interface TopProducto {
  productoId: number;
  nombre: string;
  fotoUrl?: string;
  cantidadVendida: number;
}

export interface MaquinaInactiva {
  maquinaId: number;
  nombre: string;
  barNombre: string;
  diasInactiva: number;
}

export interface ResumenMoneda {
  monedaId: number;
  valorCentimos: number;
  cantidadEnviada: number;
}

type TabType = 'PRODUCTOS' | 'MONEDAS' | 'PEDIDOS' | 'ALERTAS';

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

  maquinas = signal<Maquina[]>([]);
  activeTab = signal<TabType>('PRODUCTOS');

  // Estados de carga por pestaña
  loading = signal(false);

  // Filtros (cada pestaña puede usar los mismos campos en HTML pero unidos a estos signals)
  rangoTiempo = signal<string>('MES'); 
  maquinaId = signal<string>('');

  // Datos de cada pestaña
  topProductos = signal<TopProducto[] | null>(null);
  monedas = signal<ResumenMoneda[] | null>(null);
  totalPedidos = signal<number | null>(null);
  alertas = signal<MaquinaInactiva[] | null>(null);

  constructor() {
    // Escuchar cambios en la pestaña o en los filtros para recargar los datos necesarios
    effect(() => {
      const tab = this.activeTab();
      const rango = this.rangoTiempo();
      const maq = this.maquinaId();

      this.cargarDatos(tab, rango, maq);
    });
  }

  ngOnInit() {
    this.cargarMaquinas();
  }

  cargarMaquinas() {
    this.api.get<Maquina[]>('maquinas').subscribe(res => {
      this.maquinas.set(res.filter(m => m.activa));
    });
  }

  private cargarDatos(tab: TabType, rango: string, maq: string) {
    this.loading.set(true);
    let params: Record<string, string | number> = { rangoTiempo: rango };
    if (maq !== '') params['maquinaId'] = maq; // maq ya es string, la API lo convierte a número automáticamente

    if (tab === 'PRODUCTOS') {
      this.api.get<TopProducto[]>('estadisticas/top-productos', params).subscribe({
        next: (data) => { this.topProductos.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else if (tab === 'MONEDAS') {
      this.api.get<ResumenMoneda[]>('estadisticas/monedas', params).subscribe({
        next: (data) => { this.monedas.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else if (tab === 'PEDIDOS') {
      this.api.get<number>('estadisticas/pedidos', params).subscribe({
        next: (data) => { this.totalPedidos.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else if (tab === 'ALERTAS') {
      this.api.get<MaquinaInactiva[]>('estadisticas/alertas').subscribe({
        next: (data) => { this.alertas.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  cambiarRango(evt: Event) {
    const val = (evt.target as HTMLSelectElement).value;
    this.rangoTiempo.set(val);
  }

  cambiarMaquina(evt: Event) {
    const val = (evt.target as HTMLSelectElement).value;
    this.maquinaId.set(val);
  }
}
