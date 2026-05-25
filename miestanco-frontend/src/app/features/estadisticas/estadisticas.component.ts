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

export interface ResumenMonedasGlobal {
  totalGlobal: ResumenMoneda[];
  porMaquina: MonedasPorMaquina[];
}

export interface MonedasPorMaquina {
  maquinaId: number;
  nombreMaquina: string;
  monedas: ResumenMoneda[];
}

type TabType = 'PRODUCTOS' | 'MONEDAS' | 'PEDIDOS' | 'ALERTAS';

export interface ResumenPedidos {
  totalGlobal: number;
  porMaquina: PedidosPorMaquina[];
}

export interface PedidosPorMaquina {
  maquinaId: number;
  nombreMaquina: string;
  totalPedidos: number;
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

  maquinas = signal<Maquina[]>([]);
  activeTab = signal<TabType>('PRODUCTOS');

  // Estados de carga por pestaña
  loading = signal(false);

  // Filtros (cada pestaña puede usar los mismos campos en HTML pero unidos a estos signals)
  rangoTiempo = signal<string>('MES'); 
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  maquinaId = signal<string>('');

  // Datos de cada pestaña
  topProductos = signal<TopProducto[] | null>(null);
  monedas = signal<ResumenMonedasGlobal | null>(null);
  totalPedidos = signal<ResumenPedidos | null>(null);
  alertas = signal<MaquinaInactiva[] | null>(null);

  constructor() {
    // Escuchar cambios en la pestaña o en los filtros para recargar los datos necesarios
    effect(() => {
      const tab = this.activeTab();
      const rango = this.rangoTiempo();
      const fInicio = this.fechaInicio();
      const fFin = this.fechaFin();
      const maq = this.maquinaId();

      // Solo recargar si no es custom, o si es custom y tiene ambas fechas
      if (rango !== 'CUSTOM' || (fInicio && fFin)) {
        this.cargarDatos(tab, rango, fInicio, fFin, maq);
      }
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

  private cargarDatos(tab: TabType, rango: string, fInicio: string, fFin: string, maq: string) {
    this.loading.set(true);
    let params: Record<string, string | number> = { rangoTiempo: rango };
    
    if (rango === 'CUSTOM' && fInicio && fFin) {
      params['fechaInicio'] = fInicio;
      params['fechaFin'] = fFin;
    }
    
    if (maq !== '') { 
      params['maquinaId'] = maq;
    }

    if (tab === 'PRODUCTOS') {
      this.api.get<TopProducto[]>('estadisticas/top-productos', params).subscribe({
        next: (data) => { this.topProductos.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else if (tab === 'MONEDAS') {
      this.api.get<ResumenMonedasGlobal>('estadisticas/monedas', params).subscribe({
        next: (data) => { this.monedas.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else if (tab === 'PEDIDOS') {
      this.api.get<ResumenPedidos>('estadisticas/pedidos', params).subscribe({
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

  cambiarFecha(tipo: 'inicio' | 'fin', evt: Event) {
    const val = (evt.target as HTMLInputElement).value;
    if (tipo === 'inicio') this.fechaInicio.set(val);
    else this.fechaFin.set(val);
  }

  cambiarMaquina(evt: Event) {
    const val = (evt.target as HTMLSelectElement).value;
    this.maquinaId.set(val);
  }
}
