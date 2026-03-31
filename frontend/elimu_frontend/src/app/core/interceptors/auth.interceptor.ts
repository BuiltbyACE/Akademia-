import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip auth header for login and refresh endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  const token = authService.getAccessToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        // Try to refresh token
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(clonedReq);
          }),
          catchError(refreshError => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
