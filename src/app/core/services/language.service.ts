import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeAr from '@angular/common/locales/ar';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';

export type SupportedLanguage = 'en' | 'ar' | 'de' | 'fr';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'selectedLanguage';
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'en';

  private currentLanguageSubject = new BehaviorSubject<SupportedLanguage>(this.DEFAULT_LANGUAGE);
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translateService?: TranslateService;

  readonly supportedLanguages: LanguageOption[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      dir: 'ltr'
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      dir: 'rtl'
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      dir: 'ltr'
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      dir: 'ltr'
    }
  ];

  constructor() {
    this.registerLocales();
    // Don't initialize language here, wait for TranslateService
  }

  // Initialize TranslateService after it's available
  initializeTranslateService(translateService: TranslateService): void {
    this.translateService = translateService;

    // Now initialize the language after we have the translate service
    const savedLanguage = this.getSavedLanguage();
    const browserLanguage = this.getBrowserLanguage();
    const initialLanguage = savedLanguage || browserLanguage || this.DEFAULT_LANGUAGE;

    // Set the initial language without triggering setLanguage (to avoid double loading)
    this.currentLanguageSubject.next(initialLanguage);
    this.updateHtmlAttributes(initialLanguage);

    // Set the fallback language
    this.translateService.setFallbackLang('en');
  }

  private registerLocales(): void {
    registerLocaleData(localeEn, 'en');
    registerLocaleData(localeAr, 'ar');
    registerLocaleData(localeDe, 'de');
    registerLocaleData(localeFr, 'fr');
  }

  private getSavedLanguage(): SupportedLanguage | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const saved = localStorage.getItem(this.STORAGE_KEY);
    return this.isSupportedLanguage(saved) ? saved : null;
  }

  private getBrowserLanguage(): SupportedLanguage | null {
    if (typeof navigator === 'undefined') {
      return null;
    }

    const browserLang = navigator.language.split('-')[0];
    return this.isSupportedLanguage(browserLang) ? browserLang : null;
  }

  private isSupportedLanguage(lang: string | null): lang is SupportedLanguage {
    return lang === 'en' || lang === 'ar' || lang === 'de' || lang === 'fr';
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  getCurrentLanguageOption(): LanguageOption {
    const currentLang = this.getCurrentLanguage();
    return this.supportedLanguages.find(lang => lang.code === currentLang) || this.supportedLanguages[0];
  }

  getCurrentLocale(): string {
    const currentLang = this.getCurrentLanguage();
    switch (currentLang) {
      case 'ar': return 'ar-SA';
      case 'de': return 'de-DE';
      case 'fr': return 'fr-FR';
      default: return 'en-US';
    }
  }

  setLanguage(language: SupportedLanguage): void {
    if (!this.isSupportedLanguage(language)) {
      console.warn(`Unsupported language: ${language}. Falling back to ${this.DEFAULT_LANGUAGE}`);
      language = this.DEFAULT_LANGUAGE;
    }

    // Update translate service if available
    if (this.translateService) {
      this.translateService.use(language);
    }

    // Update HTML attributes
    this.updateHtmlAttributes(language);

    // Save to localStorage
    this.saveLanguage(language);

    // Emit change
    this.currentLanguageSubject.next(language);
  }

  private updateHtmlAttributes(language: SupportedLanguage): void {
    if (typeof document === 'undefined') {
      return;
    }

    const html = document.documentElement;
    const languageOption = this.supportedLanguages.find(lang => lang.code === language);

    if (languageOption) {
      html.setAttribute('lang', language);
      html.setAttribute('dir', languageOption.dir);
    }
  }

  private saveLanguage(language: SupportedLanguage): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.STORAGE_KEY, language);
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.getCurrentLanguageOption().dir;
  }

  isRTL(): boolean {
    return this.getDirection() === 'rtl';
  }

  switchLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang: SupportedLanguage = currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  // Utility method for getting translated text programmatically
  getTranslation(key: string, params?: any): Observable<string> {
    if (!this.translateService) {
      return new Observable(subscriber => subscriber.next(key));
    }
    return this.translateService.get(key, params);
  }

  getInstantTranslation(key: string, params?: any): string {
    if (!this.translateService) {
      return key;
    }
    return this.translateService.instant(key, params);
  }
}
