import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth if the request has the X-Skip-Auth header
    if (request.headers.has('X-Skip-Auth')) {
      // Remove the X-Skip-Auth header before sending to server
      const newRequest = request.clone({
        headers: request.headers.delete('X-Skip-Auth')
      });
      return next.handle(newRequest);
    }

    // Add auth header if token exists and not an auth endpoint or public endpoint
    const token = this.tokenService.getAccessToken();
    if (token && !this.isAuthEndpoint(request.url) && !this.isPublicEndpoint(request.url)) {
      request = this.addAuthHeader(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401 && !this.isAuthEndpoint(request.url)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.getRefreshToken();
      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((success: boolean) => {
            this.isRefreshing = false;
            if (success) {
              const newToken = this.tokenService.getAccessToken();
              this.refreshTokenSubject.next(newToken);
              return next.handle(this.addAuthHeader(request, newToken!));
            } else {
              // Refresh failed, logout user
              this.authService.logout();
              return throwError(() => new Error('Token refresh failed'));
            }
          }),
          catchError(error => {
            this.isRefreshing = false;
            this.authService.logout();
            return throwError(() => error);
          })
        );
      } else {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // If already refreshing, wait for the refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addAuthHeader(request, token)))
      );
    }
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];

    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/Projects?', // Public projects endpoint with query params
      '/Projects/', // Public project detail endpoint
      '/Awards?', // Public awards endpoint
      '/Contact', // Public contact endpoint
      '/health' // Health check endpoint
    ];

    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }
}
