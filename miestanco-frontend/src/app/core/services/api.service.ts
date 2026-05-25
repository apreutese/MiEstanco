import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = '/api';
  private http = inject(HttpClient);

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.BASE}/${path}`, { params }).pipe(map(r => r.datos));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.BASE}/${path}`, body).pipe(map(r => r.datos));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.BASE}/${path}`, body).pipe(map(r => r.datos));
  }

  patch<T>(path: string, body?: unknown, params?: Record<string, string>): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.BASE}/${path}`, body ?? {}, { params }).pipe(map(r => r.datos));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.BASE}/${path}`).pipe(map(r => r.datos));
  }

  postForm<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.BASE}/${path}`, formData).pipe(map(r => r.datos));
  }
}
