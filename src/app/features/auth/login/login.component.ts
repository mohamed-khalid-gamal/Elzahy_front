import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AuthDebugService } from '../../../core/services/auth-debug.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LoadingComponent, AlertComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2 class="login-title">{{ showTwoFactor ? 'Two-Factor Authentication' : 'Login' }}</h2>

        <app-alert
          *ngIf="errorMessage"
          type="error"
          [message]="errorMessage"
          (close)="clearError()"
        ></app-alert>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" *ngIf="!showTwoFactor">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              class="form-control"
              formControlName="email"
              [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="Enter your email"
            >
            <div class="invalid-feedback" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <span *ngIf="loginForm.get('email')?.hasError('required')">Email is required</span>
              <span *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              class="form-control"
              formControlName="password"
              [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              placeholder="Enter your password"
            >
            <div class="invalid-feedback" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password is required
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="loginForm.invalid || isLoading"
          >
            <app-loading *ngIf="isLoading" size="small"></app-loading>
            <span *ngIf="!isLoading">Login</span>
          </button>
        </form>

        <!-- Two-Factor Authentication Form -->
        <form [formGroup]="twoFactorForm" (ngSubmit)="onTwoFactorSubmit()" *ngIf="showTwoFactor">
          <p class="text-muted mb-4">
            Please enter the 6-digit code from your authenticator app or use a recovery code.
          </p>

          <div class="form-group" *ngIf="!showRecoveryCode">
            <label for="twoFactorCode">Authentication Code</label>
            <input
              id="twoFactorCode"
              type="text"
              class="form-control text-center"
              formControlName="code"
              placeholder="000000"
              maxlength="6"
              [class.is-invalid]="twoFactorForm.get('code')?.invalid && twoFactorForm.get('code')?.touched"
            >
            <div class="invalid-feedback" *ngIf="twoFactorForm.get('code')?.invalid && twoFactorForm.get('code')?.touched">
              Please enter a 6-digit code
            </div>
          </div>

          <div class="form-group" *ngIf="showRecoveryCode">
            <label for="recoveryCode">Recovery Code</label>
            <input
              id="recoveryCode"
              type="text"
              class="form-control"
              formControlName="recoveryCode"
              placeholder="Enter recovery code"
              [class.is-invalid]="twoFactorForm.get('recoveryCode')?.invalid && twoFactorForm.get('recoveryCode')?.touched"
            >
            <div class="invalid-feedback" *ngIf="twoFactorForm.get('recoveryCode')?.invalid && twoFactorForm.get('recoveryCode')?.touched">
              Recovery code is required
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block mb-3"
            [disabled]="twoFactorForm.invalid || isLoading"
          >
            <app-loading *ngIf="isLoading" size="small"></app-loading>
            <span *ngIf="!isLoading">{{ showRecoveryCode ? 'Verify Recovery Code' : 'Verify Code' }}</span>
          </button>

          <button
            type="button"
            class="btn btn-link btn-block"
            (click)="toggleRecoveryCode()"
            [disabled]="isLoading"
          >
            {{ showRecoveryCode ? 'Use authenticator code' : 'Use recovery code' }}
          </button>

          <button
            type="button"
            class="btn btn-secondary btn-block"
            (click)="backToLogin()"
            [disabled]="isLoading"
          >
            Back to Login
          </button>
        </form>

        <div class="login-links" *ngIf="!showTwoFactor">
          <a routerLink="/forgot-password">Forgot Password?</a>
          <span class="mx-2">•</span>
          <a routerLink="/register">Create Account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 1rem;
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 400px;
    }

    .login-title {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }

    .btn-link {
      background: none;
      color: #007bff;
      text-decoration: underline;
    }

    .btn-link:hover:not(:disabled) {
      color: #0056b3;
    }

    .btn-block {
      width: 100%;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-links {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .login-links a {
      color: #007bff;
      text-decoration: none;
    }

    .login-links a:hover {
      text-decoration: underline;
    }

    .text-muted {
      color: #6c757d;
    }

    .text-center {
      text-align: center;
    }

    .mb-3 {
      margin-bottom: 1rem;
    }

    .mb-4 {
      margin-bottom: 1.5rem;
    }

    .mx-2 {
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  twoFactorForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showTwoFactor = false;
  showRecoveryCode = false;
  tempToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authDebugService: AuthDebugService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForms();
    // Clear any existing auth data and log state
    this.authDebugService.clearAuthData();
  }

  private initializeForms() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.pattern(/^\d{6}$/)]],
      recoveryCode: ['']
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.clearError();

    const credentials = this.loginForm.value;
    console.log('Attempting login with credentials:', { email: credentials.email });

    this.authService.login(credentials).subscribe({
      next: (result) => {
        this.isLoading = false;
        console.log('Login result:', result);

        if (result.success) {
          console.log('Login successful, checking authentication state...');
          this.authDebugService.logAuthState();
          this.router.navigate(['/admin/dashboard']);
        } else if (result.requiresTwoFactor) {
          this.tempToken = result.tempToken!;
          this.showTwoFactor = true;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = error.message || 'Login failed';
      }
    });
  }

  onTwoFactorSubmit() {
    if (this.twoFactorForm.invalid) return;

    this.isLoading = true;
    this.clearError();

    if (this.showRecoveryCode) {
      const request = {
        tempToken: this.tempToken,
        recoveryCode: this.twoFactorForm.get('recoveryCode')?.value
      };

      this.authService.verifyRecoveryCode(request).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Recovery code verification failed';
        }
      });
    } else {
      const request = {
        tempToken: this.tempToken,
        code: this.twoFactorForm.get('code')?.value
      };

      this.authService.verifyTwoFactor(request).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || '2FA verification failed. Check your phone time sync.';
        }
      });
    }
  }

  toggleRecoveryCode() {
    this.showRecoveryCode = !this.showRecoveryCode;
    this.clearError();

    // Reset form validators
    if (this.showRecoveryCode) {
      this.twoFactorForm.get('code')?.clearValidators();
      this.twoFactorForm.get('recoveryCode')?.setValidators([Validators.required]);
    } else {
      this.twoFactorForm.get('recoveryCode')?.clearValidators();
      this.twoFactorForm.get('code')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
    }

    this.twoFactorForm.get('code')?.updateValueAndValidity();
    this.twoFactorForm.get('recoveryCode')?.updateValueAndValidity();
  }

  backToLogin() {
    this.showTwoFactor = false;
    this.showRecoveryCode = false;
    this.tempToken = '';
    this.clearError();
    this.twoFactorForm.reset();
  }

  clearError() {
    this.errorMessage = '';
  }
}
