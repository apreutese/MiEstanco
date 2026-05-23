import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, ApiResponse, Rol } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api';
  private http = inject(HttpClient);
  private router = inject(Router);

  // Estado reactivo con Signals
  private _usuario = signal<LoginResponse | null>(this.cargarSesion());
  readonly usuario = computed(() => this._usuario());
  readonly isAuthenticated = computed(() => this._usuario() !== null);
  readonly isAdmin = computed(() => this._usuario()?.rol === Rol.ADMIN);
  readonly nombreUsuario = computed(() => this._usuario()?.nombre ?? '');

  login(request: LoginRequest) {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API}/auth/login`, request).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('session', JSON.stringify(res.datos));
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
    return this._usuario()?.token ?? null;
  }

  private cargarSesion(): LoginResponse | null {
    try {
      const raw = localStorage.getItem('session');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

