import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert" [ngClass]="'alert-' + type" *ngIf="show">
      <div class="alert-content">
        <div class="alert-icon">
          <span *ngIf="type === 'success'">✓</span>
          <span *ngIf="type === 'error'">✕</span>
          <span *ngIf="type === 'warning'">⚠</span>
          <span *ngIf="type === 'info'">ℹ</span>
        </div>
        <div class="alert-message">
          {{ message }}
        </div>
        <button
          *ngIf="dismissible"
          class="alert-close"
          (click)="onClose()"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .alert {
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
    }

    .alert-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .alert-icon {
      font-weight: bold;
      font-size: 1.1rem;
      min-width: 1.2rem;
      text-align: center;
    }

    .alert-message {
      flex: 1;
      line-height: 1.5;
    }

    .alert-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      font-weight: bold;
      cursor: pointer;
      padding: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .alert-close:hover {
      opacity: 1;
    }

    .alert-success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
    }

    .alert-error {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }

    .alert-warning {
      color: #856404;
      background-color: #fff3cd;
      border-color: #ffeaa7;
    }

    .alert-info {
      color: #0c5460;
      background-color: #d1ecf1;
      border-color: #bee5eb;
    }
  `]
})
export class AlertComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message = '';
  @Input() dismissible = true;
  @Input() show = true;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.show = false;
    this.close.emit();
  }
}
