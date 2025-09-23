import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for could not be found.</p>
        <div class="actions">
          <a routerLink="/" class="btn btn-primary">Go Home</a>
          <button (click)="goBack()" class="btn btn-secondary">Go Back</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    }

    .not-found-content {
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
      cursor: pointer;
      background: none;
      font-size: 1rem;
    }

    .btn-primary {
      background: white;
      color: #667eea;
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
      color: #667eea;
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
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
