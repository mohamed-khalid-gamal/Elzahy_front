import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, AlertComponent],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-card">
        <h2>Reset Password</h2>

        <app-alert
          *ngIf="error"
          [message]="error"
          [type]="'error'"
          (dismiss)="error = null">
        </app-alert>

        <app-alert
          *ngIf="success"
          [message]="success"
          [type]="'success'"
          (dismiss)="success = null">
        </app-alert>

        <div *ngIf="!isValidToken && !isLoading" class="invalid-token">
          <div class="icon">⚠️</div>
          <h3>Invalid Reset Link</h3>
          <p>This password reset link is invalid or has expired.</p>
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-primary"
              (click)="goToForgotPassword()"
            >
              Request New Link
            </button>
          </div>
        </div>

        <form
          *ngIf="isValidToken && !passwordReset"
          (ngSubmit)="onSubmit()"
          #resetForm="ngForm"
        >
          <div class="form-group">
            <label for="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="formData.password"
              #password="ngModel"
              required
              minlength="8"
              class="form-control"
              [class.is-invalid]="password.invalid && password.touched"
              placeholder="Enter your new password"
            />
            <div *ngIf="password.invalid && password.touched" class="invalid-feedback">
              <small *ngIf="password.errors?.['required']">Password is required</small>
              <small *ngIf="password.errors?.['minlength']">Password must be at least 8 characters</small>
            </div>
            <div class="password-requirements">
              <small>Password must be at least 8 characters long</small>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="formData.confirmPassword"
              #confirmPassword="ngModel"
              required
              class="form-control"
              [class.is-invalid]="confirmPassword.invalid && confirmPassword.touched || (confirmPassword.touched && formData.password !== formData.confirmPassword)"
              placeholder="Confirm your new password"
            />
            <div *ngIf="confirmPassword.touched && formData.password !== formData.confirmPassword" class="invalid-feedback">
              <small>Passwords do not match</small>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="resetForm.invalid || isLoading || formData.password !== formData.confirmPassword"
            >
              <app-loading *ngIf="isLoading" size="small"></app-loading>
              Reset Password
            </button>
          </div>
        </form>

        <div *ngIf="passwordReset" class="success-message">
          <div class="icon">✓</div>
          <h3>Password Reset Successful</h3>
          <p>Your password has been reset successfully. You can now sign in with your new password.</p>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-primary"
              (click)="goToLogin()"
            >
              Sign In
            </button>
          </div>
        </div>

        <div class="auth-links" *ngIf="!passwordReset">
          <p>Remember your password? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 20px;
    }

    .reset-password-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    h2 {
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
      text-align: left;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      text-align: left;
    }

    .password-requirements {
      margin-top: 0.25rem;
    }

    .password-requirements small {
      color: #666;
      font-size: 0.875rem;
    }

    .form-actions {
      margin-top: 1.5rem;
    }

    .btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
      display: flex;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .invalid-token,
    .success-message {
      text-align: center;
    }

    .invalid-token .icon,
    .success-message .icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin: 0 auto 1rem;
    }

    .invalid-token .icon {
      background-color: #ffc107;
      color: white;
    }

    .success-message .icon {
      background-color: #28a745;
      color: white;
    }

    .invalid-token h3,
    .success-message h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .invalid-token p,
    .success-message p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .auth-links {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .auth-links a {
      color: #007bff;
      text-decoration: none;
    }

    .auth-links a:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  formData = {
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  isValidToken = false;
  passwordReset = false;
  private resetToken = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];
      if (this.resetToken) {
        this.validateToken();
      } else {
        this.error = 'Invalid reset link. Missing token.';
      }
    });
  }

  private async validateToken(): Promise<void> {
    this.isLoading = true;
    try {
      // In a real app, you might want to validate the token with the backend
      // For now, we'll assume any token is valid
      this.isValidToken = true;
    } catch (error: any) {
      this.error = 'Invalid or expired reset token.';
      this.isValidToken = false;
    } finally {
      this.isLoading = false;
    }
  }

  onSubmit(): void {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.authService.resetPassword({
      token: this.resetToken,
      newPassword: this.formData.password
    }).subscribe({
      next: () => {
        this.passwordReset = true;
        this.success = 'Password reset successfully!';
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to reset password. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['forgot-password']);
  }
}
