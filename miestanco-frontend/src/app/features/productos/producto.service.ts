import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Producto, Categoria } from '../../core/models/models';

export interface ProductoPayload {
  nombre: string; marca?: string; categoria: Categoria; precio: number;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = inject(ApiService);
  listar(): Observable<Producto[]>                         { return this.api.get<Producto[]>('productos'); }
  obtener(id: number): Observable<Producto>               { return this.api.get<Producto>(`productos/${id}`); }
  crear(p: ProductoPayload): Observable<Producto>         { return this.api.post<Producto>('productos', p); }
  editar(id: number, p: ProductoPayload): Observable<Producto> { return this.api.put<Producto>(`productos/${id}`, p); }
  subirFoto(id: number, f: FormData): Observable<Producto> { return this.api.postForm<Producto>(`productos/${id}/foto`, f); }
  desactivar(id: number): Observable<void>                { return this.api.patch<void>(`productos/${id}/desactivar`); }
  activar(id: number): Observable<void>                   { return this.api.patch<void>(`productos/${id}/activar`); }
}
