import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Pedido, EstadoPedido, Bar, Maquina, Producto, Moneda } from '../../core/models/models';

export interface CrearPedidoPayload {
  maquinaId: number;
  productos: Record<number, number>;
  monedas: Record<number, number>;
  notas?: string;
  offlineId?: string;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private api = inject(ApiService);

  listarActivos(): Observable<Pedido[]> {
    return this.api.get<Pedido[]>('pedidos');
  }

  historial(params?: { estado?: EstadoPedido; maquinaId?: number; desde?: string; hasta?: string }): Observable<Pedido[]> {
    const query = new URLSearchParams();
    if (params?.estado) query.set('estado', params.estado);
    if (params?.maquinaId) query.set('maquinaId', String(params.maquinaId));
    if (params?.desde) query.set('desde', params.desde);
    if (params?.hasta) query.set('hasta', params.hasta);
    const qs = query.toString();
    return this.api.get<Pedido[]>(`pedidos/historial${qs ? '?' + qs : ''}`);
  }

  obtener(id: number): Observable<Pedido> {
    return this.api.get<Pedido>(`pedidos/${id}`);
  }

  ultimoPedidoMaquina(maquinaId: number): Observable<Pedido> {
    return this.api.get<Pedido>(`pedidos/maquina/${maquinaId}/ultimo`);
  }

  crear(payload: CrearPedidoPayload): Observable<Pedido> {
    return this.api.post<Pedido>('pedidos', payload);
  }

  editar(id: number, payload: Omit<CrearPedidoPayload, 'maquinaId' | 'offlineId'>): Observable<Pedido> {
    return this.api.put<Pedido>(`pedidos/${id}`, payload);
  }

  cambiarEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.api.patch<Pedido>(`pedidos/${id}/estado`, null, { estado });
  }

  marcarItemProducto(pedidoId: number, lineaId: number, preparada: boolean): Observable<Pedido> {
    return this.api.patch<Pedido>(`pedidos/${pedidoId}/items/producto/${lineaId}`, null, { preparada: String(preparada) });
  }

  marcarItemMoneda(pedidoId: number, lineaId: number, preparada: boolean): Observable<Pedido> {
    return this.api.patch<Pedido>(`pedidos/${pedidoId}/items/moneda/${lineaId}`, null, { preparada: String(preparada) });
  }

  cancelar(id: number): Observable<Pedido> {
    return this.api.patch<Pedido>(`pedidos/${id}/cancelar`);
  }

  // Catálogos para el formulario de crear pedido
  bares(): Observable<Bar[]> {
    return this.api.get<Bar[]>('bares');
  }

  maquinasPorBar(barId: number): Observable<Maquina[]> {
    return this.api.get<Maquina[]>(`maquinas/bar/${barId}`);
  }

  maquina(id: number): Observable<Maquina> {
    return this.api.get<Maquina>(`maquinas/${id}`);
  }
}
