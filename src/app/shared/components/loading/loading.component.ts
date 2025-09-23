import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [ngClass]="'loading-' + size">
      <div class="loading-spinner"></div>
      <div *ngIf="message" class="loading-message">{{ message }}</div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .loading-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-small .loading-spinner {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .loading-medium .loading-spinner {
      width: 40px;
      height: 40px;
      border-width: 3px;
    }

    .loading-large .loading-spinner {
      width: 60px;
      height: 60px;
      border-width: 4px;
    }

    .loading-message {
      margin-top: 1rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message?: string;
}
