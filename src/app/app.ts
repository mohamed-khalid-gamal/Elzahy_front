import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TokenService } from './core/services/token.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'Elzahy Portfolio';

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit() {
    // Listen to route changes for analytics, etc.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // You can add analytics tracking here
      console.log('Navigated to:', event.url);
    });

    // Initialize user session if tokens exist
    if (this.tokenService.isAuthenticated()) {
      // Optional: Validate token or refresh user data
      console.log('User is authenticated');
    }
  }
}
