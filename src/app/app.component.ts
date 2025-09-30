import { Component, inject, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { NavigationComponent } from './components/navigation/navigation.component';
import { AppBackgroundComponent } from './components/app-background/app-background.component';
import { FooterComponent } from './components/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TestTranslationService } from './test-translation.service';

import { ScrollService } from './services/scroll.service';
import { PerformanceService } from './services/performance.service';
import { LcpOptimizationService } from './services/lcp-optimization.service';
import { PerformanceOptimizationService } from './services/performance-optimization.service';
import { SeoService } from './services/seo.service';
import { LanguageService } from './core/services/language.service';
import { MetaService } from './core/services/meta.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SharedModule, NavigationComponent, AppBackgroundComponent, FooterComponent, TranslateModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'project-angular';
  translationsLoaded = false;

  // Inject services
  private scrollService = inject(ScrollService);
  private performanceService = inject(PerformanceService);
  private lcpOptimizationService = inject(LcpOptimizationService);
  private performanceOptimizationService = inject(PerformanceOptimizationService);
  private seoService = inject(SeoService);
  private languageService = inject(LanguageService);
  private metaService = inject(MetaService);
  private translateService = inject(TranslateService);
  private testTranslationService = inject(TestTranslationService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Test translation file access first
    this.testTranslationService.testTranslationFiles();

    // Initialize translation service first
    this.initializeTranslations();

    // Only run browser-specific optimizations on client side
    if (isPlatformBrowser(this.platformId)) {
      // Initialize SEO service and structured data
      this.seoService.generateOrganizationStructuredData();

      // Initialize LCP optimizations immediately
      this.lcpOptimizationService.optimizeLCP();
      this.lcpOptimizationService.injectCriticalCSS();

      // Setup performance monitoring
      this.performanceOptimizationService.optimizeResourceLoading();
      this.performanceOptimizationService.setupIntersectionObserver();
      this.performanceOptimizationService.reportMetrics();

      // Remove app loader after initial load
      this.removeAppLoader();
    }

    // Initialize services (only if methods exist)
    // The services will auto-initialize
  }

  private initializeTranslations(): void {
    console.log('🌐 Initializing translations...');

    // Set the default language immediately
    this.translateService.setDefaultLang('en');
    console.log('✅ Set default language to: en');

    // Initialize LanguageService with TranslateService
    console.log('🔧 Initializing LanguageService...');
    this.languageService.initializeTranslateService(this.translateService);

    // Load the current language and wait for it to complete
    const currentLang = this.languageService.getCurrentLanguage();
    console.log('🌍 Current language detected:', currentLang);

    this.translateService.use(currentLang).subscribe({
      next: (translations) => {
        this.translationsLoaded = true;
        console.log('✅ Translations loaded for language:', currentLang);
        console.log('📝 Available translations keys:', Object.keys(translations));

        // Test a translation
        const testTranslation = this.translateService.instant('nav.home');
        console.log('🧪 Test translation for "nav.home":', testTranslation);
      },
      error: (error) => {
        console.error('❌ Failed to load translations:', error);
        console.error('📍 Error details:', {
          message: error.message,
          status: error.status,
          url: error.url
        });
        this.translationsLoaded = true; // Still show the app even if translations fail
      }
    });

    // Subscribe to language changes to update meta tags
    this.languageService.currentLanguage$.subscribe((lang) => {
      console.log('🔄 Language changed to:', lang);
      // Load new language translations
      this.translateService.use(lang).subscribe(() => {
        console.log('✅ New language translations loaded:', lang);
        // Update meta tags when language changes
        this.updateCurrentPageMeta();
      });
    });
  }

  private updateCurrentPageMeta(): void {
    // This will be called whenever language changes
    // The specific meta tags will be updated by individual pages
    const currentUrl = window.location.pathname;

    switch (currentUrl) {
      case '/':
        this.metaService.updateHomeMeta();
        break;
      case '/projects':
        this.metaService.updateProjectsMeta();
        break;
      case '/awards':
        this.metaService.updateAwardsMeta();
        break;
      case '/about':
        this.metaService.updateAboutMeta();
        break;
      case '/contact':
        this.metaService.updateContactMeta();
        break;
      default:
        this.metaService.updateHomeMeta();
    }
  }

  /**
   * Remove the initial app loader for better user experience
   */
  private removeAppLoader(): void {
    // Wait for initial render to complete
    setTimeout(() => {
      const loader = document.getElementById('app-loader');
      if (loader) {
        loader.classList.add('loaded');
        // Remove from DOM after transition
        setTimeout(() => {
          loader.remove();
        }, 300);
      }
    }, 100);
  }

  private initializePerformanceOptimizations(): void {
    // Only run performance optimizations after initial render
    this.performanceService.runWhenIdle(() => {
      // Measure Core Web Vitals
      this.performanceService.measureCoreWebVitals();

      // Optimize animations
      this.performanceService.optimizeAnimations();
    });
  }
}
