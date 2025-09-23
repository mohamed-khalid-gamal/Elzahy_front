import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { User } from '../../../shared/types/api.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  template: `
    <div class="profile-container">
      <!-- Loading State -->
      <div *ngIf="isLoadingUser" class="flex justify-center py-12">
        <app-loading size="large" message="Loading user data..."></app-loading>
      </div>

      <div *ngIf="!isLoadingUser" class="pt-20 pb-8">
        <div class="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your account settings and security</p>
        </div>

      <div class="profile-grid">
        <!-- Profile Information -->
        <div class="profile-card">
          <h2>Profile Information</h2>

          <div *ngIf="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
            <div class="form-group">
              <label for="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="profileData.name"
                #name="ngModel"
                required
                class="form-control"
                [class.is-invalid]="name.invalid && name.touched"
              />
              <div *ngIf="name.invalid && name.touched" class="invalid-feedback">
                Name is required
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                [value]="user?.email"
                readonly
                class="form-control readonly"
              />
              <small class="form-text">Email cannot be changed</small>
            </div>

            <div class="form-group">
              <label for="language">Language</label>
              <select
                id="language"
                name="language"
                [(ngModel)]="profileData.language"
                class="form-control"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div class="form-group">
              <label>Role</label>
              <input
                type="text"
                [value]="user?.role"
                readonly
                class="form-control readonly"
              />
              <small class="form-text">Role is assigned by system administrator</small>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="profileForm.invalid || isLoading"
              >
                <span *ngIf="isLoading" class="spinner"></span>
                Update Profile
              </button>
            </div>
          </form>
        </div>

        <!-- Password Change -->
        <div class="profile-card">
          <h2>Change Password</h2>

          <div *ngIf="passwordSuccessMessage" class="alert alert-success">
            {{ passwordSuccessMessage }}
          </div>

          <div *ngIf="passwordErrorMessage" class="alert alert-error">
            {{ passwordErrorMessage }}
          </div>

          <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                [(ngModel)]="passwordData.currentPassword"
                #currentPassword="ngModel"
                required
                class="form-control"
                [class.is-invalid]="currentPassword.invalid && currentPassword.touched"
              />
              <div *ngIf="currentPassword.invalid && currentPassword.touched" class="invalid-feedback">
                Current password is required
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                [(ngModel)]="passwordData.newPassword"
                #newPassword="ngModel"
                required
                minlength="8"
                class="form-control"
                [class.is-invalid]="newPassword.invalid && newPassword.touched"
              />
              <div *ngIf="newPassword.invalid && newPassword.touched" class="invalid-feedback">
                <div *ngIf="newPassword.errors?.['required']">New password is required</div>
                <div *ngIf="newPassword.errors?.['minlength']">Password must be at least 8 characters</div>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                [(ngModel)]="passwordData.confirmPassword"
                #confirmPassword="ngModel"
                required
                class="form-control"
                [class.is-invalid]="confirmPassword.invalid && confirmPassword.touched || (confirmPassword.touched && passwordData.newPassword !== passwordData.confirmPassword)"
              />
              <div *ngIf="confirmPassword.touched && passwordData.newPassword !== passwordData.confirmPassword" class="invalid-feedback">
                Passwords do not match
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-warning"
                [disabled]="passwordForm.invalid || isPasswordLoading || passwordData.newPassword !== passwordData.confirmPassword"
              >
                <span *ngIf="isPasswordLoading" class="spinner"></span>
                Change Password
              </button>
            </div>
          </form>
        </div>

        <!-- Two-Factor Authentication -->
        <div class="profile-card">
          <h2>Two-Factor Authentication</h2>

          <div *ngIf="twoFactorSuccessMessage" class="alert alert-success">
            {{ twoFactorSuccessMessage }}
          </div>

          <div *ngIf="twoFactorErrorMessage" class="alert alert-error">
            {{ twoFactorErrorMessage }}
          </div>

          <div class="two-factor-status">
            <div class="status-item">
              <span class="status-label">Status:</span>
              <span class="status-value" [class.enabled]="user?.twoFactorEnabled" [class.disabled]="!user?.twoFactorEnabled">
                {{ user?.twoFactorEnabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
          </div>

          <div class="two-factor-actions">
            <!-- Enable 2FA -->
            <div *ngIf="!user?.twoFactorEnabled && !showTwoFactorSetup">
              <p>Enhance your account security by enabling two-factor authentication.</p>
              <button
                class="btn btn-success"
                (click)="setupTwoFactor()"
                [disabled]="isTwoFactorLoading"
              >
                <span *ngIf="isTwoFactorLoading" class="spinner"></span>
                Enable 2FA
              </button>
            </div>

            <!-- 2FA Setup -->
            <div *ngIf="showTwoFactorSetup" class="two-factor-setup">
              <div class="setup-step">
                <h3>Step 1: Scan QR Code</h3>
                <p>Scan this QR code with your authenticator app:</p>
                <div class="qr-code">
                  <img [src]="qrCodeImage" alt="QR Code" />
                </div>
                <p>Or enter this code manually: <code>{{ manualEntryKey }}</code></p>
              </div>

              <div class="setup-step">
                <h3>Step 2: Enter Verification Code</h3>
                <form (ngSubmit)="enableTwoFactor()" #twoFactorForm="ngForm">
                  <div class="form-group">
                    <label for="twoFactorCode">Enter 6-digit code from your app</label>
                    <input
                      type="text"
                      id="twoFactorCode"
                      name="twoFactorCode"
                      [(ngModel)]="twoFactorCode"
                      #twoFactorCodeInput="ngModel"
                      required
                      pattern="[0-9]{6}"
                      maxlength="6"
                      class="form-control code-input"
                      [class.is-invalid]="twoFactorCodeInput.invalid && twoFactorCodeInput.touched"
                    />
                    <div *ngIf="twoFactorCodeInput.invalid && twoFactorCodeInput.touched" class="invalid-feedback">
                      Please enter a valid 6-digit code
                    </div>
                  </div>

                  <div class="form-actions">
                    <button
                      type="submit"
                      class="btn btn-success"
                      [disabled]="twoFactorForm.invalid || isTwoFactorLoading"
                    >
                      <span *ngIf="isTwoFactorLoading" class="spinner"></span>
                      Enable 2FA
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      (click)="cancelTwoFactorSetup()"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Disable 2FA -->
            <div *ngIf="user?.twoFactorEnabled">
              <p>Two-factor authentication is currently enabled.</p>
              <div class="two-factor-actions">
                <button
                  class="btn btn-warning"
                  (click)="generateRecoveryCodes()"
                  [disabled]="isTwoFactorLoading"
                >
                  <span *ngIf="isTwoFactorLoading && currentOperation === 'generate'" class="spinner"></span>
                  Generate New Recovery Codes
                </button>
                <button
                  class="btn btn-danger"
                  (click)="disableTwoFactor()"
                  [disabled]="isTwoFactorLoading"
                >
                  <span *ngIf="isTwoFactorLoading && currentOperation === 'disable'" class="spinner"></span>
                  Disable 2FA
                </button>
              </div>
            </div>
          </div>

          <!-- Recovery Codes Display -->
          <div *ngIf="recoveryCodes.length > 0" class="recovery-codes">
            <h3>Recovery Codes</h3>
            <p class="warning">Save these recovery codes in a safe place. Each code can only be used once.</p>
            <div class="codes-list">
              <div *ngFor="let code of recoveryCodes" class="recovery-code">
                {{ code }}
              </div>
            </div>
            <button class="btn btn-secondary" (click)="downloadRecoveryCodes()">
              Download Codes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .profile-header h1 {
      font-size: 2.5rem;
      color:rgb(213, 217, 220);
      margin-bottom: 0.5rem;
    }

    .profile-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .profile-grid {
      display: grid;
      gap: 2rem;
    }

    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .profile-card h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #ecf0f1;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #bdc3c7;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .form-control.readonly {
      background-color: #f8f9fa;
      color: #6c757d;
    }

    .form-control.is-invalid {
      border-color: #e74c3c;
    }

    .invalid-feedback {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-text {
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-warning {
      background: #f39c12;
      color: white;
    }

    .btn-warning:hover:not(:disabled) {
      background: #e67e22;
    }

    .btn-success {
      background: #27ae60;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #229954;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c0392b;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #7f8c8d;
    }

    .alert {
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .two-factor-status {
      margin-bottom: 1.5rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-label {
      font-weight: 500;
      color: #2c3e50;
    }

    .status-value {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-value.enabled {
      background: #d4edda;
      color: #155724;
    }

    .status-value.disabled {
      background: #f8d7da;
      color: #721c24;
    }

    .two-factor-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .two-factor-setup {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .setup-step {
      margin-bottom: 2rem;
    }

    .setup-step:last-child {
      margin-bottom: 0;
    }

    .setup-step h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .qr-code {
      text-align: center;
      margin: 1rem 0;
    }

    .qr-code img {
      max-width: 200px;
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      padding: 1rem;
      background: white;
    }

    .code-input {
      text-align: center;
      font-family: monospace;
      font-size: 1.2rem;
      letter-spacing: 0.5rem;
    }

    .recovery-codes {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #ecf0f1;
    }

    .recovery-codes h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .warning {
      color: #e67e22;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .codes-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .recovery-code {
      background: white;
      padding: 0.75rem;
      border-radius: 4px;
      border: 1px solid #ecf0f1;
      text-align: center;
      font-family: monospace;
      font-weight: 500;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .codes-list {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AdminProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = false;
  isLoadingUser = true;
  isPasswordLoading = false;
  isTwoFactorLoading = false;
  currentOperation = '';

  successMessage = '';
  errorMessage = '';
  passwordSuccessMessage = '';
  passwordErrorMessage = '';
  twoFactorSuccessMessage = '';
  twoFactorErrorMessage = '';

  profileData = {
    name: '',
    language: 'en'
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showTwoFactorSetup = false;
  qrCodeImage = '';
  manualEntryKey = '';
  twoFactorCode = '';
  recoveryCodes: string[] = [];

  constructor(private authService: AuthService, private notifications: NotificationService) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.isLoadingUser = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.profileData.name = user.name;
        this.profileData.language = user.language;
        this.isLoadingUser = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load user data';
        this.isLoadingUser = false;
        console.error('Failed to load user data:', error);
      }
    });
  }

  updateProfile() {
    this.isLoading = true;
    this.clearMessages();

    this.authService.updateProfile(this.profileData).subscribe({
      next: (user) => {
        this.user = user;
        this.successMessage = 'Profile updated successfully!';
        this.isLoading = false;
        this.notifications.toastSuccess('Profile updated');
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update profile';
        this.isLoading = false;
        this.notifications.toastError(this.errorMessage);
      }
    });
  }

  changePassword() {
    this.isPasswordLoading = true;
    this.clearPasswordMessages();

    // Validate that passwords match
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordErrorMessage = 'New passwords do not match';
      this.isPasswordLoading = false;
      this.notifications.toastError(this.passwordErrorMessage);
      return;
    }

    // Use the proper change password endpoint
    const changePasswordRequest = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    };

    this.authService.changePassword(changePasswordRequest).subscribe({
      next: (success) => {
        if (success) {
          this.passwordSuccessMessage = 'Password changed successfully!';
          this.passwordData = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          this.notifications.toastSuccess('Password changed successfully');
        } else {
          this.passwordErrorMessage = 'Failed to change password';
          this.notifications.toastError(this.passwordErrorMessage);
        }
        this.isPasswordLoading = false;
      },
      error: (error) => {
        this.passwordErrorMessage = error.message || 'Failed to change password';
        this.isPasswordLoading = false;
        this.notifications.toastError(this.passwordErrorMessage);
      }
    });
  }

  async disableTwoFactor() {
    const confirmed = await this.notifications.confirm({
      title: 'Disable Two-Factor Authentication',
      text: 'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
      confirmButtonText: 'Yes, disable',
      icon: 'warning'
    });
    if (!confirmed) return;

    this.isTwoFactorLoading = true;
    this.currentOperation = 'disable';
    this.clearTwoFactorMessages();

    this.authService.disableTwoFactor().subscribe({
      next: () => {
        this.twoFactorSuccessMessage = 'Two-factor authentication disabled';

        // Update user data
        if (this.user) {
          this.user.twoFactorEnabled = false;
        }

        this.isTwoFactorLoading = false;
        this.notifications.toastSuccess('Two-factor disabled');
      },
      error: (error) => {
        this.twoFactorErrorMessage = error.message || 'Failed to disable 2FA';
        this.isTwoFactorLoading = false;
        this.notifications.toastError(this.twoFactorErrorMessage);
      }
    });
  }

  setupTwoFactor() {
    this.isTwoFactorLoading = true;
    this.currentOperation = 'setup';
    this.clearTwoFactorMessages();

    this.authService.setupTwoFactor().subscribe({
      next: (response) => {
        this.qrCodeImage = this.normalizeQrCodeSrc(response.qrCodeImage);
        this.manualEntryKey = response.manualEntryKey;
        this.showTwoFactorSetup = true;
        this.isTwoFactorLoading = false;
        this.notifications.toastInfo('Scan the QR code to continue');
      },
      error: (error) => {
        this.twoFactorErrorMessage = error.message || 'Failed to setup 2FA';
        this.isTwoFactorLoading = false;
        this.notifications.toastError(this.twoFactorErrorMessage);
      }
    });
  }

  enableTwoFactor() {
    this.isTwoFactorLoading = true;
    this.currentOperation = 'enable';
    this.clearTwoFactorMessages();

    this.authService.enableTwoFactor(this.twoFactorCode).subscribe({
      next: (response) => {
        this.twoFactorSuccessMessage = 'Two-factor authentication enabled successfully!';
        this.recoveryCodes = response.recoveryCodes;
        this.showTwoFactorSetup = false;
        this.twoFactorCode = '';

        // Update user data
        if (this.user) {
          this.user.twoFactorEnabled = true;
        }

        this.isTwoFactorLoading = false;
        this.notifications.fire('2FA Enabled', 'Keep your recovery codes safe.', 'success');
      },
      error: (error) => {
        this.twoFactorErrorMessage = error.message || 'Failed to enable 2FA';
        this.isTwoFactorLoading = false;
        this.notifications.toastError(this.twoFactorErrorMessage);
      }
    });
  }

  generateRecoveryCodes() {
    this.isTwoFactorLoading = true;
    this.currentOperation = 'generate';
    this.clearTwoFactorMessages();

    this.authService.generateRecoveryCodes().subscribe({
      next: (codes) => {
        this.recoveryCodes = codes;
        this.twoFactorSuccessMessage = 'New recovery codes generated';
        this.isTwoFactorLoading = false;
        this.notifications.toastSuccess('Recovery codes generated');
      },
      error: (error) => {
        this.twoFactorErrorMessage = error.message || 'Failed to generate recovery codes';
        this.isTwoFactorLoading = false;
        this.notifications.toastError(this.twoFactorErrorMessage);
      }
    });
  }

  cancelTwoFactorSetup() {
    this.showTwoFactorSetup = false;
    this.qrCodeImage = '';
    this.manualEntryKey = '';
    this.twoFactorCode = '';
    this.clearTwoFactorMessages();
  }

  downloadRecoveryCodes() {
    const content = this.recoveryCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-codes.txt';
    link.click();

    window.URL.revokeObjectURL(url);
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private clearPasswordMessages() {
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';
  }

  private clearTwoFactorMessages() {
    this.twoFactorSuccessMessage = '';
    this.twoFactorErrorMessage = '';
  }

  private normalizeQrCodeSrc(value: string): string {
    if (!value) return '';
    return value.startsWith('data:image') ? value : `data:image/png;base64,${value}`;
  }
}
