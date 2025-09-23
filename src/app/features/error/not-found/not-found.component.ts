import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="error-page">
            <h1 class="display-1 text-primary">404</h1>
            <h2 class="mb-4">Page Not Found</h2>
            <p class="lead mb-4">
              Sorry, the page you are looking for could not be found.
            </p>
            <div class="d-flex gap-3 justify-content-center">
              <button
                class="btn btn-primary"
                (click)="goHome()">
                Go Home
              </button>
              <button
                class="btn btn-outline-secondary"
                (click)="goBack()">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      padding: 2rem;
    }

    .display-1 {
      font-size: 6rem;
      font-weight: bold;
    }

    .container {
      min-height: 70vh;
      display: flex;
      align-items: center;
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    window.history.back();
  }
}
