import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, AuthResponse } from '../../shared/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize user from storage on service creation
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Get access token from memory first, fallback to localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   * WARNING: This stores refresh token in localStorage which is vulnerable to XSS.
   * For production, consider using httpOnly cookies on the backend.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Store authentication tokens and user data
   */
  setTokens(authResponse: AuthResponse): void {
    console.log('Setting tokens...', authResponse);

    if (authResponse.accessToken) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, authResponse.accessToken);
      console.log('Access token stored');
    }

    if (authResponse.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
      console.log('Refresh token stored');
    }

    if (authResponse.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
      this.currentUserSubject.next(authResponse.user);
      console.log('User data stored:', authResponse.user);
    }

    console.log('All tokens and user data stored successfully');
  }

  /**
   * Update only the access token (used during token refresh)
   */
  updateAccessToken(accessToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  /**
   * Update user data
   */
  updateUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Clear all tokens and user data
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      console.log('No access token found');
      return false;
    }

    try {
      // Decode JWT to check expiry (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        console.log('Access token has expired');
        this.clearTokens();
        return false;
      }

      console.log('User is authenticated with valid token');
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Get current user from memory
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  /**
   * Check if current user has admin role
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Admin';
  }

  /**
   * Get user's role
   */
  getUserRole(): string | null {
    return this.getCurrentUser()?.role || null;
  }

  /**
   * Get current user from memory (alias for getCurrentUser)
   */
  getUser(): User | null {
    return this.getCurrentUser();
  }

  /**
   * Set user data (alias for updateUser)
   */
  setUser(user: User): void {
    this.updateUser(user);
  }
}
