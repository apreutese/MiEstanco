import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Bar } from '../../core/models/models';

export interface BarPayload {
  codigo: string; nombre: string; direccion?: string;
  telefono?: string; notas?: string;
}

@Injectable({ providedIn: 'root' })
export class BarService {
  private api = inject(ApiService);
  listar(): Observable<Bar[]>              { return this.api.get<Bar[]>('bares'); }
  obtener(id: number): Observable<Bar>    { return this.api.get<Bar>(`bares/${id}`); }
  crear(b: BarPayload): Observable<Bar>   { return this.api.post<Bar>('bares', b); }
  editar(id: number, b: BarPayload): Observable<Bar> { return this.api.put<Bar>(`bares/${id}`, b); }
  desactivar(id: number): Observable<void> { return this.api.patch<void>(`bares/${id}/desactivar`); }
  activar(id: number): Observable<void>    { return this.api.patch<void>(`bares/${id}/activar`); }
}
