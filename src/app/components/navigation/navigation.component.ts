import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100px)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ])
    ]),
    trigger('mobileMenuSlide', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, height: 0 }))
      ])
    ]),
    trigger('logoHover', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.05)' })),
      transition('normal <=> hovered', animate('200ms ease-in-out'))
    ]),
    trigger('linkHover', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.05)' })),
      transition('normal <=> hovered', animate('200ms ease-in-out'))
    ])
  ]
})
export class NavigationComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  logoHoverState = 'normal';
  linkHoverStates: { [key: string]: string } = {};
  isAuthenticated = false;
  isAdmin = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    // Initialize scroll detection
    this.onWindowScroll();

    // Initialize hover states for nav items
    this.navItems.forEach(item => {
      this.linkHoverStates[item.path] = 'normal';
    });

    // Check authentication status
    this.checkAuthStatus();

    // Subscribe to user changes to update authentication status
    const userSub = this.tokenService.currentUser$.subscribe(() => {
      this.checkAuthStatus();
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkAuthStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdmin = this.authService.isAdmin();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  navItems = [
    { label: 'Home', path: '/' },
    { label: 'Projects', path: '/projects' },
    { label: 'Awards', path: '/awards' },
    { label: 'About Us', path: '/about' },
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onLogoHover(hovered: boolean) {
    this.logoHoverState = hovered ? 'hovered' : 'normal';
  }

  onLinkHover(path: string, hovered: boolean) {
    this.linkHoverStates[path] = hovered ? 'hovered' : 'normal';
  }

  logout() {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
