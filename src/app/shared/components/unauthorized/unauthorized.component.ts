import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="error-code">403</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this resource.</p>
        <div class="actions">
          <a routerLink="/" class="btn btn-primary">Go Home</a>
          <a routerLink="/auth/login" class="btn btn-secondary">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    }

    .unauthorized-content {
      max-width: 500px;
    }

    .error-code {
      font-size: 8rem;
      font-weight: 700;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    p {
      font-size: 1.125rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 2rem;
      border: 2px solid white;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-primary {
      background: white;
      color: #dc3545;
    }

    .btn-primary:hover {
      background: transparent;
      color: white;
      text-decoration: none;
    }

    .btn-secondary {
      background: transparent;
      color: white;
    }

    .btn-secondary:hover {
      background: white;
      color: #dc3545;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .error-code {
        font-size: 6rem;
      }

      h1 {
        font-size: 2rem;
      }

      .actions {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 200px;
      }
    }
  `]
})
export class UnauthorizedComponent {}
