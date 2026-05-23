import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Usuario, Rol } from '../../core/models/models';

export interface CrearUsuarioPayload { nombre: string; username: string; password: string; rol: Rol; }
export interface ActualizarUsuarioPayload { nombre: string; rol: Rol; }

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private api = inject(ApiService);
  listar(): Observable<Usuario[]>                              { return this.api.get<Usuario[]>('usuarios'); }
  obtener(id: number): Observable<Usuario>                    { return this.api.get<Usuario>(`usuarios/${id}`); }
  crear(u: CrearUsuarioPayload): Observable<Usuario>          { return this.api.post<Usuario>('usuarios', u); }
  editar(id: number, u: ActualizarUsuarioPayload): Observable<Usuario> { return this.api.put<Usuario>(`usuarios/${id}`, u); }
  cambiarPassword(id: number, password: string): Observable<void> { return this.api.patch<void>(`usuarios/${id}/password`, { password }); }
  desactivar(id: number): Observable<void>                    { return this.api.patch<void>(`usuarios/${id}/desactivar`); }
  activar(id: number): Observable<void>                       { return this.api.patch<void>(`usuarios/${id}/activar`); }
}
