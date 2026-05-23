import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, ApiResponse, Rol } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api';
  private http = inject(HttpClient);
  private router = inject(Router);

  private _usuario = signal<LoginResponse | null>(this.cargarSesion());

  readonly usuario    = computed(() => this._usuario());
  readonly isAuthenticated = computed(() => this._usuario() !== null);
  readonly isAdmin    = computed(() => this._usuario()?.rol === Rol.ADMIN);
  readonly nombreUsuario = computed(() => this._usuario()?.nombre ?? '');

  login(request: LoginRequest) {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API}/auth/login`, request).pipe(
      tap(res => {
        if (res.success && res.datos) {
          // 1. Guardar en localStorage ANTES de navegar
          localStorage.setItem('session', JSON.stringify(res.datos));
          // 2. Actualizar signal — el interceptor ya tendrá el token en la próxima petición
          this._usuario.set(res.datos);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('session');
    this._usuario.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    // Lee de localStorage directamente para evitar timing issues con la signal
    try {
      const raw = localStorage.getItem('session');
      if (!raw) return null;
      const sesion: LoginResponse = JSON.parse(raw);
      return sesion?.token ?? null;
    } catch { return null; }
  }

  private cargarSesion(): LoginResponse | null {
    try {
      const raw = localStorage.getItem('session');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
