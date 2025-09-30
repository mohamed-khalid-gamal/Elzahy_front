import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth-functional.interceptor';
import { CustomPreloadingStrategy } from './app/services/custom-preloading.strategy';
import { LanguageService } from './app/core/services/language.service';

function initTranslations(translate: TranslateService, languageService: LanguageService) {
  return () => {
    // Determine initial language (saved -> browser -> default)
    let initial = 'en';
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('selectedLanguage') : null;
      if (saved === 'en' || saved === 'ar') initial = saved;
      else if (typeof navigator !== 'undefined') {
        const browser = (navigator.language || '').split('-')[0];
        if (browser === 'en' || browser === 'ar') initial = browser;
      }
    } catch {}

    translate.setFallbackLang('en');
    // Use Promise to block bootstrap until the first language file is loaded
    return new Promise<void>((resolve) => {
      translate.use(initial).subscribe({ next: () => resolve(), error: () => resolve() });
    });
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withPreloading(CustomPreloadingStrategy)),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
    }),
    // Translation providers: first register module/config, then override loader
    importProvidersFrom(
      TranslateModule.forRoot({
        lang: 'en',
        fallbackLang: 'en',
        extend: false
      })
    ),
    // Use an absolute path so it works on all routes
    provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService, LanguageService],
      multi: true
    }
  ],
}).then(() => {
  // Remove/Hide splash loader after bootstrap
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('loaded');
    setTimeout(() => loader.remove(), 400); // allow transition
  }
}).catch((err: unknown) => console.error(err));
