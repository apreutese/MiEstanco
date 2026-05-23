import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Solo hacer logout en 401 si tenemos sesión activa y no es login
      if (err.status === 401 && !req.url.includes('/auth/login') && auth.isAuthenticated()) {
        // Usar setTimeout para no interferir con el ciclo de change detection
        setTimeout(() => auth.logout(), 0);
      }
      return throwError(() => err);
    })
  );
};
