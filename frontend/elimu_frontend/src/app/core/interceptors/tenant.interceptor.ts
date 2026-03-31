import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.currentUser();
  const tenantSlug = user?.tenant_slug;

  if (tenantSlug && !req.url.includes('/auth/')) {
    req = req.clone({
      setHeaders: {
        'X-Tenant-Slug': tenantSlug
      }
    });
  }

  return next(req);
};
