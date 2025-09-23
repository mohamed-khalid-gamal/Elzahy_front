import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent, AlertComponent],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Create Account</h2>

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

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="formData.username"
              #username="ngModel"
              required
              minlength="3"
              class="form-control"
              [class.is-invalid]="username.invalid && username.touched"
            />
            <div *ngIf="username.invalid && username.touched" class="invalid-feedback">
              <small *ngIf="username.errors?.['required']">Username is required</small>
              <small *ngIf="username.errors?.['minlength']">Username must be at least 3 characters</small>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="formData.email"
              #email="ngModel"
              required
              email
              class="form-control"
              [class.is-invalid]="email.invalid && email.touched"
            />
            <div *ngIf="email.invalid && email.touched" class="invalid-feedback">
              <small *ngIf="email.errors?.['required']">Email is required</small>
              <small *ngIf="email.errors?.['email']">Please enter a valid email</small>
            </div>
          </div>

          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              [(ngModel)]="formData.firstName"
              #firstName="ngModel"
              required
              class="form-control"
              [class.is-invalid]="firstName.invalid && firstName.touched"
            />
            <div *ngIf="firstName.invalid && firstName.touched" class="invalid-feedback">
              <small *ngIf="firstName.errors?.['required']">First name is required</small>
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              [(ngModel)]="formData.lastName"
              #lastName="ngModel"
              required
              class="form-control"
              [class.is-invalid]="lastName.invalid && lastName.touched"
            />
            <div *ngIf="lastName.invalid && lastName.touched" class="invalid-feedback">
              <small *ngIf="lastName.errors?.['required']">Last name is required</small>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
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
            />
            <div *ngIf="password.invalid && password.touched" class="invalid-feedback">
              <small *ngIf="password.errors?.['required']">Password is required</small>
              <small *ngIf="password.errors?.['minlength']">Password must be at least 8 characters</small>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="formData.confirmPassword"
              #confirmPassword="ngModel"
              required
              class="form-control"
              [class.is-invalid]="confirmPassword.invalid && confirmPassword.touched || (confirmPassword.touched && formData.password !== formData.confirmPassword)"
            />
            <div *ngIf="confirmPassword.touched && formData.password !== formData.confirmPassword" class="invalid-feedback">
              <small>Passwords do not match</small>
            </div>
          </div>

          <div class="form-group">
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  name="requestAdminRole"
                  [(ngModel)]="formData.requestAdminRole"
                  (change)="onAdminRoleToggle()"
                />
                <span>Request Administrator Privileges</span>
              </label>
              <p class="help-text">Check this if you need admin access to manage content</p>
            </div>
          </div>

          <div *ngIf="formData.requestAdminRole" class="form-group admin-request-section">
            <label for="adminReason">Reason for Admin Access</label>
            <textarea
              id="adminReason"
              name="adminReason"
              [(ngModel)]="formData.adminReason"
              #adminReason="ngModel"
              [required]="formData.requestAdminRole"
              class="form-control textarea"
              [class.is-invalid]="adminReason.invalid && adminReason.touched"
              placeholder="Please explain why you need administrator privileges..."
              rows="3"
            ></textarea>
            <div *ngIf="adminReason.invalid && adminReason.touched" class="invalid-feedback">
              <small *ngIf="adminReason.errors?.['required']">Please provide a reason for requesting admin access</small>
            </div>
          </div>

          <div *ngIf="formData.requestAdminRole" class="form-group">
            <label for="adminAdditionalInfo">Additional Information (Optional)</label>
            <textarea
              id="adminAdditionalInfo"
              name="adminAdditionalInfo"
              [(ngModel)]="formData.adminAdditionalInfo"
              class="form-control textarea"
              placeholder="Any additional information that supports your request..."
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  name="terms"
                  [(ngModel)]="formData.terms"
                  #terms="ngModel"
                  required
                />
                <span>I accept the <a href="#" class="terms-link">Terms and Conditions</a></span>
              </label>
            </div>
            <div *ngIf="terms.invalid && terms.touched" class="invalid-feedback">
              <small>You must accept the terms and conditions</small>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="registerForm.invalid || isLoading || formData.password !== formData.confirmPassword"
            >
              <app-loading *ngIf="isLoading" size="small"></app-loading>
              Create Account
            </button>
          </div>
        </form>

        <div class="auth-links">
          <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 20px;
    }

    .register-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
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

    .auth-links {
      text-align: center;
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

    .checkbox-group {
      margin-bottom: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-weight: normal;
      cursor: pointer;
      line-height: 1.5;
    }

    .checkbox-label input[type="checkbox"] {
      margin: 0;
      width: auto;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .help-text {
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 0.25rem;
      margin-bottom: 0;
    }

    .admin-request-section {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 1rem;
      margin-top: 0.5rem;
    }

    .textarea {
      resize: vertical;
      min-height: 80px;
    }

    .terms-link {
      color: #007bff;
      text-decoration: none;
    }

    .terms-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 576px) {
      .register-card {
        padding: 1.5rem;
        margin: 10px;
      }
    }
  `]
})
export class RegisterComponent {
  formData = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    requestAdminRole: false,
    adminReason: '',
    adminAdditionalInfo: '',
    terms: false
  };

  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onAdminRoleToggle(): void {
    if (!this.formData.requestAdminRole) {
      this.formData.adminReason = '';
      this.formData.adminAdditionalInfo = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (!this.formData.terms) {
      this.error = 'You must accept the terms and conditions';
      return;
    }

    if (this.formData.requestAdminRole && !this.formData.adminReason.trim()) {
      this.error = 'Please provide a reason for requesting admin access';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const registerData: any = {
        email: this.formData.email,
        name: `${this.formData.firstName} ${this.formData.lastName}`,
        password: this.formData.password,
        terms: this.formData.terms,
        requestAdminRole: this.formData.requestAdminRole
      };

      if (this.formData.requestAdminRole) {
        registerData.adminRequestReason = this.formData.adminReason;
        if (this.formData.adminAdditionalInfo.trim()) {
          registerData.adminRequestAdditionalInfo = this.formData.adminAdditionalInfo;
        }
      }

      await this.authService.register(registerData).toPromise();

      if (this.formData.requestAdminRole) {
        this.success = 'Account created successfully! Your admin role request has been submitted for review. Please check your email for verification instructions.';
      } else {
        this.success = 'Account created successfully! Please check your email for verification instructions.';
      }

      // Redirect to login after a short delay
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    } catch (error: any) {
      this.error = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
