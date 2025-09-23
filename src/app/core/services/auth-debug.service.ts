import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthDebugService {
  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  logAuthState(): void {
    console.group('🔐 Authentication State Debug');

    const accessToken = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();
    const user = this.tokenService.getCurrentUser();
    const isAuthenticated = this.authService.isAuthenticated();

    console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'None');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None');
    console.log('Current User:', user);
    console.log('Is Authenticated:', isAuthenticated);

    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Token Payload:', {
          exp: new Date(payload.exp * 1000),
          iat: new Date(payload.iat * 1000),
          userId: payload.sub,
          role: payload.role
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    console.groupEnd();
  }

  clearAuthData(): void {
    console.log('🧹 Clearing all authentication data');
    this.tokenService.clearTokens();
    this.logAuthState();
  }
}
