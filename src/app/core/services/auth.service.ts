import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  TwoFactorSetupResponse,
  TwoFactorEnableResponse,
  TwoFactorVerifyRequest,
  RecoveryCodeVerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
  ChangePasswordRequestDto,
  AdminRoleRequestDto,
  AdminRoleRequestResponseDto,
  ProcessAdminRequestDto,
  CreateUserRequestDto,
  AdminUserDto,
  EnhancedRegisterRequestDto
} from '../../shared/types/api.types';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;
  private isRefreshingToken = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  /**
   * User login
   */
  login(credentials: LoginRequest): Observable<{ success: boolean; requiresTwoFactor?: boolean; tempToken?: string }> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        map(response => {
          console.log('Login API response:', response);

          if (response.ok && response.data) {
            if (response.data.requiresTwoFactor) {
              const tempToken: string | undefined = response.data.tempToken ?? undefined;
              if (tempToken) {
                return { success: false, requiresTwoFactor: true, tempToken };
              }
              return { success: false, requiresTwoFactor: true };
            } else {
              // Store tokens and user data
              console.log('Storing tokens...', response.data);
              this.tokenService.setTokens(response.data);
              console.log('Tokens stored. Access token:', this.tokenService.getAccessToken());
              return { success: true };
            }
          }
          throw new Error(response.error?.message || 'Login failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * User registration (enhanced with admin role request)
   */
  register(userData: EnhancedRegisterRequestDto): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.ok && response.data) {
            this.tokenService.setTokens(response.data);
          }
        }),
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Registration failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Verify two-factor authentication code
   */
  verifyTwoFactor(request: TwoFactorVerifyRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/2fa/verify`, request)
      .pipe(
        tap(response => {
          if (response.ok && response.data) {
            this.tokenService.setTokens(response.data);
          }
        }),
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || '2FA verification failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Verify recovery code
   */
  verifyRecoveryCode(request: RecoveryCodeVerifyRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/2fa/verify-recovery`, request)
      .pipe(
        tap(response => {
          if (response.ok && response.data) {
            this.tokenService.setTokens(response.data);
          }
        }),
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Recovery code verification failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Setup two-factor authentication
   */
  setupTwoFactor(): Observable<TwoFactorSetupResponse> {
    return this.http.post<ApiResponse<TwoFactorSetupResponse>>(`${this.baseUrl}/auth/2fa/setup`, {})
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || '2FA setup failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Enable two-factor authentication
   */
  enableTwoFactor(code: string): Observable<TwoFactorEnableResponse> {
    return this.http.post<ApiResponse<TwoFactorEnableResponse>>(`${this.baseUrl}/auth/2fa/enable`, { code })
      .pipe(
        tap(response => {
          if (response.ok) {
            // Update user's 2FA status
            const currentUser = this.tokenService.getCurrentUser();
            if (currentUser) {
              this.tokenService.updateUser({ ...currentUser, twoFactorEnabled: true });
            }
          }
        }),
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || '2FA enable failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get user profile
   */
  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/auth/me`)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to get profile');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor(): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/2fa/disable`, {})
      .pipe(
        map(response => {
          if (response.ok) {
            return;
          }
          throw new Error(response.error?.message || 'Failed to disable 2FA');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Generate new recovery codes
   */
  generateRecoveryCodes(): Observable<string[]> {
    return this.http.post<ApiResponse<{ recoveryCodes: string[]; count: number; generatedAt: string }>>(`${this.baseUrl}/auth/2fa/recovery-codes`, {})
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data.recoveryCodes;
          }
          throw new Error(response.error?.message || 'Recovery codes generation failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<boolean> {
    if (this.isRefreshingToken) {
      // If already refreshing, wait for the current refresh to complete
      return this.refreshTokenSubject.asObservable().pipe(
        map(token => !!token)
      );
    }

    this.isRefreshingToken = true;
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      this.isRefreshingToken = false;
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(`${this.baseUrl}/auth/refresh-token`, {
      refreshToken
    }).pipe(
      tap(response => {
        this.isRefreshingToken = false;
        if (response.ok && response.data) {
          this.tokenService.updateAccessToken(response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          this.refreshTokenSubject.next(response.data.accessToken);
        } else {
          this.refreshTokenSubject.next(null);
          this.logout();
        }
      }),
      map(response => {
        if (response.ok && response.data) {
          return true;
        }
        throw new Error('Token refresh failed');
      }),
      catchError(error => {
        this.isRefreshingToken = false;
        this.refreshTokenSubject.next(null);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/auth/me`)
      .pipe(
        tap(response => {
          if (response.ok && response.data) {
            this.tokenService.updateUser(response.data);
          }
        }),
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to get user');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/auth/me`, updates)
      .pipe(
        tap(response => {
          if (response.ok && response.data) {
            this.tokenService.updateUser(response.data);
          }
        }),
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Profile update failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Forgot password
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    console.log('Sending forgot password request to:', `${this.baseUrl}/auth/forgot-password`);
    console.log('Request payload:', request);

    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/forgot-password`, request)
      .pipe(
        tap(response => {
          console.log('Forgot password response:', response);
        }),
        map(response => {
          if (response.ok) {
            console.log('Password reset email sent successfully');
            return;
          }
          throw new Error(response.error?.message || 'Password reset request failed');
        }),
        catchError(error => {
          console.error('Forgot password error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Reset password
   */
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    console.log('Sending reset password request to:', `${this.baseUrl}/auth/reset-password`);
    console.log('Request payload:', request);

    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/reset-password`, request)
      .pipe(
        tap(response => {
          console.log('Reset password response:', response);
        }),
        map(response => {
          if (response.ok) {
            console.log('Password reset successful');
            return;
          }
          throw new Error(response.error?.message || 'Password reset failed');
        }),
        catchError(error => {
          console.error('Reset password error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Change password (for logged-in users)
   */
  changePassword(request: ChangePasswordRequestDto): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/auth/change-password`, request)
      .pipe(
        map(response => {
          if (response.ok && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Password change failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Request admin role
   */
  requestAdminRole(request: AdminRoleRequestDto): Observable<AdminRoleRequestResponseDto> {
    return this.http.post<ApiResponse<AdminRoleRequestResponseDto>>(`${this.baseUrl}/auth/request-admin`, request)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Admin role request failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get all admin requests (Admin only)
   */
  getAdminRequests(): Observable<AdminRoleRequestResponseDto[]> {
    return this.http.get<ApiResponse<AdminRoleRequestResponseDto[]>>(`${this.baseUrl}/admin/requests`)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to get admin requests');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Process admin request (Admin only)
   */
  processAdminRequest(requestId: string, request: ProcessAdminRequestDto): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/admin/requests/${requestId}/process`, request)
      .pipe(
        map(response => {
          if (response.ok && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to process admin request');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get all users (Admin only)
   */
  getAllUsers(): Observable<AdminUserDto[]> {
    return this.http.get<ApiResponse<AdminUserDto[]>>(`${this.baseUrl}/admin/users`)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to get users');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create user (Admin only)
   */
  createUser(userData: CreateUserRequestDto): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/admin/users`, userData)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'User creation failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete user (Admin only)
   */
  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/admin/users/${userId}`)
      .pipe(
        map(response => {
          if (response.ok && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.error?.message || 'User deletion failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();

    if (refreshToken) {
      // Call logout endpoint to invalidate refresh token
      this.http.post(`${this.baseUrl}/auth/logout`, { refreshToken }).subscribe({
        error: (error) => console.error('Logout error:', error)
      });
    }

    this.tokenService.clearTokens();
    this.router.navigate(['/']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.tokenService.isAdmin();
  }

  /**
   * Check if current user can perform admin actions
   */
  canPerformAdminActions(): boolean {
    return this.isAdmin() && this.isAuthenticated();
  }

  /**
   * Check if user account is locked
   */
  isAccountLocked(): boolean {
    const user = this.tokenService.getCurrentUser();
    if (!user || !user.lockoutEnd) return false;

    const lockoutEnd = new Date(user.lockoutEnd);
    return lockoutEnd > new Date();
  }

  /**
   * Get account lockout status
   */
  getAccountLockoutInfo(): { isLocked: boolean; lockoutEnd?: Date; remainingTime?: number } {
    const user = this.tokenService.getCurrentUser();
    if (!user || !user.lockoutEnd) {
      return { isLocked: false };
    }

    const lockoutEnd = new Date(user.lockoutEnd);
    const now = new Date();
    const isLocked = lockoutEnd > now;

    return {
      isLocked,
      lockoutEnd,
      remainingTime: isLocked ? lockoutEnd.getTime() - now.getTime() : undefined
    };
  }

  /**
   * Get user role display name
   */
  getUserRoleDisplayName(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'user':
        return 'User';
      default:
        return role;
    }
  }

  /**
   * Check if email is confirmed
   */
  isEmailConfirmed(): boolean {
    const user = this.tokenService.getCurrentUser();
    return user ? user.emailConfirmed : false;
  }

  /**
   * Check if 2FA is enabled for current user
   */
  isTwoFactorEnabled(): boolean {
    const user = this.tokenService.getCurrentUser();
    return user ? user.twoFactorEnabled : false;
  }

  /**
   * Confirm email address
   */
  confirmEmail(token: string, userId: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/auth/confirm-email`, {
      params: { token, userId }
    })
      .pipe(
        map(response => {
          if (response.ok && response.data !== undefined) {
            // Update current user's email confirmation status if it's the same user
            const currentUser = this.tokenService.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
              this.tokenService.updateUser({ ...currentUser, emailConfirmed: true });
            }
            return response.data;
          }
          throw new Error(response.error?.message || 'Email confirmation failed');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Resend email confirmation
   */
  resendEmailConfirmation(): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/auth/resend-confirmation`, {})
      .pipe(
        map(response => {
          if (response.ok && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to resend confirmation email');
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Handle HTTP errors with enhanced error code handling
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 5000; // Default server error code

    // Extract error information from different response formats
    if (error.error && error.error.error) {
      // API response format: { error: { message: string, internalCode: number } }
      errorMessage = error.error.error.message || errorMessage;
      errorCode = error.error.error.internalCode || errorCode;
    } else if (error.error && error.error.message) {
      // Direct error format: { message: string }
      errorMessage = error.error.message;
    } else if (error.message) {
      // Error object format
      errorMessage = error.message;
    }

    // Handle specific error codes with user-friendly messages
    switch (errorCode) {
      case 4001:
        errorMessage = 'Invalid credentials. Please check your email and password.';
        break;
      case 4002:
        errorMessage = 'You must accept the terms and conditions to register.';
        break;
      case 4003:
        errorMessage = 'An account with this email already exists.';
        break;
      case 4004:
        errorMessage = 'User or resource not found.';
        break;
      case 4005:
        errorMessage = 'Two-factor authentication is not configured for this account.';
        break;
      case 4006:
        errorMessage = 'User already has admin privileges.';
        break;
      case 4007:
        errorMessage = 'You already have a pending admin role request.';
        break;
      case 4008:
        errorMessage = 'Admin permissions required to perform this action.';
        break;
      case 4009:
        errorMessage = 'This request has already been processed.';
        break;
      case 4010:
        errorMessage = 'You cannot delete your own account.';
        break;
      case 4011:
        errorMessage = 'Cannot delete the last admin user.';
        break;
      case 4012:
        errorMessage = 'Invalid role specified.';
        break;
      case 4029:
        errorMessage = 'Account is temporarily locked due to too many failed login attempts.';
        break;
      default:
        // Keep the original error message for unknown codes
        break;
    }

    console.error('Auth Error:', {
      originalError: error,
      processedMessage: errorMessage,
      errorCode
    });

    return throwError(() => new Error(errorMessage));
  }
}
