import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, AlertComponent],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <h2>Reset Password</h2>
        <p class="description">Enter your email address and we'll send you a link to reset your password.</p>

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

        <form (ngSubmit)="onSubmit()" #forgotForm="ngForm" *ngIf="!emailSent">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              #emailField="ngModel"
              required
              email
              class="form-control"
              [class.is-invalid]="emailField.invalid && emailField.touched"
              placeholder="Enter your email address"
            />
            <div *ngIf="emailField.invalid && emailField.touched" class="invalid-feedback">
              <small *ngIf="emailField.errors?.['required']">Email is required</small>
              <small *ngIf="emailField.errors?.['email']">Please enter a valid email</small>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="forgotForm.invalid || isLoading"
            >
              <app-loading *ngIf="isLoading" size="small"></app-loading>
              Send Reset Link
            </button>
          </div>
        </form>

        <div *ngIf="emailSent" class="success-message">
          <div class="icon">✓</div>
          <h3>Check your email</h3>
          <p>We've sent a password reset link to <strong>{{ email }}</strong></p>
          <p>If you don't see the email, check your spam folder.</p>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="resendEmail()"
              [disabled]="isLoading || resendCooldown > 0"
            >
              <app-loading *ngIf="isLoading" size="small"></app-loading>
              <span *ngIf="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
              <span *ngIf="resendCooldown === 0">Resend Email</span>
            </button>
          </div>
        </div>

        <div class="auth-links">
          <p>Remember your password? <a routerLink="/auth/login">Sign in</a></p>
          <p>Don't have an account? <a routerLink="/auth/register">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 20px;
    }

    .forgot-password-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    h2 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .description {
      color: #666;
      margin-bottom: 1.5rem;
      text-align: center;
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

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-message {
      text-align: center;
    }

    .success-message .icon {
      width: 60px;
      height: 60px;
      background-color: #28a745;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin: 0 auto 1rem;
    }

    .success-message h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .success-message p {
      color: #666;
      margin-bottom: 0.5rem;
    }

    .auth-links {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .auth-links p {
      margin: 0.5rem 0;
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
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  emailSent = false;
  resendCooldown = 0;
  private resendTimer: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  // Test method to check API connectivity (for debugging)
  async testEndpoint(): Promise<void> {
    const testUrl = 'https://localhost:7195/api/auth/forgot-password';
    console.log('Testing endpoint:', testUrl);

    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' })
      });

      console.log('Test response status:', response.status);
      console.log('Test response headers:', response.headers);

      const responseText = await response.text();
      console.log('Test response body:', responseText);

    } catch (error) {
      console.error('Test endpoint error:', error);
    }
  }

  async onSubmit(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.success = null;

    console.log('Submitting forgot password request for email:', this.email);

    try {
      await this.authService.forgotPassword({ email: this.email }).toPromise();
      console.log('Forgot password request successful');
      this.emailSent = true;
      this.success = 'Password reset link sent successfully!';
      this.startResendCooldown();
    } catch (error: any) {
      console.error('Forgot password request failed:', error);
      this.error = error.message || 'Failed to send reset email. Please try again.';

      // Additional error context for debugging
      if (error.status) {
        console.error('HTTP Status:', error.status);
        console.error('Error response:', error.error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async resendEmail(): Promise<void> {
    if (this.resendCooldown > 0) return;

    this.isLoading = true;
    this.error = null;
    this.success = null;

    console.log('Resending forgot password request for email:', this.email);

    try {
      await this.authService.forgotPassword({ email: this.email }).toPromise();
      console.log('Resend forgot password request successful');
      this.success = 'Password reset link sent again!';
      this.startResendCooldown();
    } catch (error: any) {
      console.error('Resend forgot password request failed:', error);
      this.error = error.message || 'Failed to resend email. Please try again.';

      // Additional error context for debugging
      if (error.status) {
        console.error('HTTP Status:', error.status);
        console.error('Error response:', error.error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60; // 60 seconds cooldown
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }
}
