import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule, LanguageSwitcherComponent],
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
    private tokenService: TokenService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private languageService: LanguageService
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

    // Update view when language changes (ensure translate pipe refreshes)
    const langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.detectChanges();
    });
    this.subscriptions.push(langSub);
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

  get isRtl(): boolean {
    return this.languageService.isRTL();
  }

  navItems = [
    { label: 'nav.home', path: '/' },
    { label: 'nav.projects', path: '/projects' },
    { label: 'nav.awards', path: '/awards' },
    { label: 'nav.about', path: '/about' },
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
