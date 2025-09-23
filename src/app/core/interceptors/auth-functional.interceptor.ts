import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const authService = inject(AuthService);

  // Normalize URL for case-insensitive checks
  const urlLower = req.url.toLowerCase();

  // Determine auth endpoints and public view endpoints by URL only
  const isAuthEndpoint = urlLower.includes('/auth/login') ||
                         urlLower.includes('/auth/register') ||
                         urlLower.includes('/auth/forgot-password') ||
                         urlLower.includes('/auth/reset-password') ||
                         urlLower.includes('/auth/refresh-token');

  // Public endpoints that don't require authentication (for viewing only)
  const isPublicViewEndpoint = (
    (urlLower.includes('/api/projects') || urlLower.includes('/api/awards')) && req.method === 'GET'
  );

  // Add auth header if token exists and not an auth or public endpoint
  const token = tokenService.getAccessToken();

  console.log(`🔐 Interceptor - ${req.method} ${req.url}`, {
    hasToken: !!token,
    isAuthEndpoint,
    isPublicViewEndpoint,
    willAddAuth: !!token && !isAuthEndpoint && !isPublicViewEndpoint
  });

  let authReq = req;
  if (token && !isAuthEndpoint && !isPublicViewEndpoint) {
    authReq = authReq.clone({
      headers: authReq.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('✅ Added Authorization header');
  }

  const shouldHandle401ForThisRequest = !isAuthEndpoint && !isPublicViewEndpoint;

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401 && shouldHandle401ForThisRequest) {
        // Try refresh token then retry the original request once
        console.log('❌ 401 Unauthorized - attempting token refresh');
        return authService.refreshToken().pipe(
          switchMap(success => {
            if (success) {
              const newToken = tokenService.getAccessToken();
              if (newToken) {
                const retryReq = req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                });
                console.log('🔁 Retrying request with refreshed token');
                return next(retryReq);
              }
            }
            console.log('⚠️ Token refresh failed - clearing tokens and redirecting to login');
            tokenService.clearTokens();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
          catchError(refreshError => {
            console.log('⚠️ Refresh error - clearing tokens and redirecting to login');
            tokenService.clearTokens();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
