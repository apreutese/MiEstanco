import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Maquina } from '../../core/models/models';

export interface MaquinaPayload {
  nombre: string; notas?: string;
  barId: number; productoIds: number[]; monedaIds: number[];
}

@Injectable({ providedIn: 'root' })
export class MaquinaService {
  private api = inject(ApiService);
  listar(): Observable<Maquina[]>                      { return this.api.get<Maquina[]>('maquinas'); }
  porBar(barId: number): Observable<Maquina[]>         { return this.api.get<Maquina[]>(`maquinas/bar/${barId}`); }
  obtener(id: number): Observable<Maquina>             { return this.api.get<Maquina>(`maquinas/${id}`); }
  crear(m: MaquinaPayload): Observable<Maquina>        { return this.api.post<Maquina>('maquinas', m); }
  editar(id: number, m: MaquinaPayload): Observable<Maquina> { return this.api.put<Maquina>(`maquinas/${id}`, m); }
  desactivar(id: number): Observable<void>             { return this.api.patch<void>(`maquinas/${id}/desactivar`); }
  activar(id: number): Observable<void>                { return this.api.patch<void>(`maquinas/${id}/activar`); }
}
