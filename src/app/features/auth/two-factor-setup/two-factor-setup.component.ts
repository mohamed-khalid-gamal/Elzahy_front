import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TwoFactorSetupResponse } from '../../../shared/types/api.types';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingComponent, AlertComponent],
  template: `
    <div class="setup-container">
      <div class="setup-card">
        <h2 class="setup-title">Enable Two-Factor Authentication</h2>

        <app-alert
          *ngIf="errorMessage"
          type="error"
          [message]="errorMessage"
          (close)="clearError()"
        ></app-alert>

        <app-alert
          *ngIf="successMessage"
          type="success"
          [message]="successMessage"
          (close)="clearSuccess()"
        ></app-alert>

        <!-- Step 1: Setup -->
        <div *ngIf="!setupData && !isEnabled" class="step">
          <h4>Step 1: Setup</h4>
          <p class="text-muted">
            Two-factor authentication adds an extra layer of security to your account.
          </p>
          <button
            type="button"
            class="btn btn-primary"
            (click)="startSetup()"
            [disabled]="isLoading"
          >
            <app-loading *ngIf="isLoading" size="small"></app-loading>
            <span *ngIf="!isLoading">Start Setup</span>
          </button>
        </div>

        <!-- Step 2: QR Code -->
        <div *ngIf="setupData && !isEnabled" class="step">
          <h4>Step 2: Scan QR Code</h4>
          <p class="text-muted">
            Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.).
          </p>

          <div class="qr-container">
            <img [src]="setupData.qrCodeImage" alt="QR Code" class="qr-code">
          </div>

          <div class="manual-entry">
            <h5>Can't scan? Enter manually:</h5>
            <div class="manual-key">
              <code>{{ setupData.manualEntryKey }}</code>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary ml-2"
                (click)="copyToClipboard(setupData.manualEntryKey)"
              >
                Copy
              </button>
            </div>
          </div>

          <!-- Step 3: Verify -->
          <div class="verification-step">
            <h4>Step 3: Verify</h4>
            <p class="text-muted">
              Enter the 6-digit code from your authenticator app to complete setup.
            </p>

            <form [formGroup]="verificationForm" (ngSubmit)="enableTwoFactor()">
              <div class="form-group">
                <label for="verificationCode">Verification Code</label>
                <input
                  id="verificationCode"
                  type="text"
                  class="form-control text-center"
                  formControlName="code"
                  placeholder="000000"
                  maxlength="6"
                  [class.is-invalid]="verificationForm.get('code')?.invalid && verificationForm.get('code')?.touched"
                >
                <div class="invalid-feedback" *ngIf="verificationForm.get('code')?.invalid && verificationForm.get('code')?.touched">
                  Please enter a 6-digit code
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="verificationForm.invalid || isLoading"
              >
                <app-loading *ngIf="isLoading" size="small"></app-loading>
                <span *ngIf="!isLoading">Enable 2FA</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Success: Recovery Codes -->
        <div *ngIf="isEnabled && recoveryCodes.length > 0" class="step">
          <h4>🎉 Two-Factor Authentication Enabled!</h4>

          <div class="recovery-codes-section">
            <h5>⚠️ Important: Save Your Recovery Codes</h5>
            <p class="text-muted">
              These recovery codes can be used to access your account if you lose your authenticator device.
              Save them in a secure location - they won't be shown again.
            </p>

            <div class="recovery-codes">
              <div class="code-item" *ngFor="let code of recoveryCodes">
                {{ code }}
              </div>
            </div>

            <div class="recovery-actions">
              <button
                type="button"
                class="btn btn-outline-primary mr-3"
                (click)="downloadRecoveryCodes()"
              >
                📥 Download as .txt
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary mr-3"
                (click)="copyRecoveryCodes()"
              >
                📋 Copy All
              </button>
            </div>

            <div class="confirmation-checkbox">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [(ngModel)]="confirmationChecked"
                  [ngModelOptions]="{standalone: true}"
                >
                I have saved my recovery codes in a secure location
              </label>
            </div>

            <button
              type="button"
              class="btn btn-success mt-3"
              [disabled]="!confirmationChecked"
              (click)="complete()"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 1rem;
    }

    .setup-card {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 600px;
    }

    .setup-title {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
      font-weight: 600;
    }

    .step {
      margin-bottom: 2rem;
    }

    .step h4 {
      color: #333;
      margin-bottom: 1rem;
    }

    .text-muted {
      color: #6c757d;
      margin-bottom: 1.5rem;
    }

    .qr-container {
      text-align: center;
      margin: 2rem 0;
    }

    .qr-code {
      max-width: 250px;
      border: 2px solid #dee2e6;
      border-radius: 0.5rem;
    }

    .manual-entry {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 0.375rem;
      margin: 1.5rem 0;
    }

    .manual-entry h5 {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #495057;
    }

    .manual-key {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .manual-key code {
      background-color: #e9ecef;
      padding: 0.5rem;
      border-radius: 0.25rem;
      flex: 1;
      word-break: break-all;
      font-family: 'Courier New', monospace;
    }

    .verification-step {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #dee2e6;
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

    .text-center {
      text-align: center;
    }

    .recovery-codes-section {
      margin-top: 1rem;
    }

    .recovery-codes {
      background-color: #f8f9fa;
      border: 2px solid #007bff;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .code-item {
      background-color: white;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      text-align: center;
      border: 1px solid #dee2e6;
    }

    .recovery-actions {
      margin: 1.5rem 0;
    }

    .confirmation-checkbox {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 0.375rem;
      padding: 1rem;
      margin: 1.5rem 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: #856404;
      margin: 0;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 1.2rem;
      height: 1.2rem;
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

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #1e7e34;
    }

    .btn-outline-primary {
      background: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .btn-outline-primary:hover:not(:disabled) {
      background-color: #007bff;
      color: white;
    }

    .btn-outline-secondary {
      background: transparent;
      color: #6c757d;
      border: 1px solid #6c757d;
    }

    .btn-outline-secondary:hover:not(:disabled) {
      background-color: #6c757d;
      color: white;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .ml-2 {
      margin-left: 0.5rem;
    }

    .mr-3 {
      margin-right: 1rem;
    }

    .mt-3 {
      margin-top: 1rem;
    }
  `]
})
export class TwoFactorSetupComponent implements OnInit {
  verificationForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  setupData: TwoFactorSetupResponse | null = null;
  isEnabled = false;
  recoveryCodes: string[] = [];
  confirmationChecked = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  startSetup() {
    this.isLoading = true;
    this.clearMessages();

    this.authService.setupTwoFactor().subscribe({
      next: (response: TwoFactorSetupResponse) => {
        this.isLoading = false;
        this.setupData = response;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.message || '2FA setup failed';
      }
    });
  }

  enableTwoFactor() {
    if (this.verificationForm.invalid) return;

    this.isLoading = true;
    this.clearMessages();

    const code = this.verificationForm.get('code')?.value;

    this.authService.enableTwoFactor(code).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isEnabled = true;
        this.recoveryCodes = response.recoveryCodes;
        this.successMessage = '2FA has been enabled successfully!';
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.message || '2FA enable failed. Please check your code.';
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.successMessage = 'Copied to clipboard!';
      setTimeout(() => this.clearSuccess(), 3000);
    });
  }

  copyRecoveryCodes() {
    const codesText = this.recoveryCodes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      this.successMessage = 'Recovery codes copied to clipboard!';
      setTimeout(() => this.clearSuccess(), 3000);
    });
  }

  downloadRecoveryCodes() {
    const codesText = `Two-Factor Authentication Recovery Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${this.recoveryCodes.join('\n')}\n\nKeep these codes in a safe place. Each code can only be used once.`;

    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-codes.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  complete() {
    // Navigate back to profile or dashboard
    this.successMessage = 'Two-factor authentication setup completed!';
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearError() {
    this.errorMessage = '';
  }

  clearSuccess() {
    this.successMessage = '';
  }
}
