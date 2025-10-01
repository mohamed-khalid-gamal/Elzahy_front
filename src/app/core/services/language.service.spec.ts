import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';

import { LanguageService, SupportedLanguage } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateService: TranslateService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(LanguageService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default language as English', () => {
    expect(service.getCurrentLanguage()).toBe('en');
  });

  it('should return supported languages', () => {
    const supportedLanguages = service.supportedLanguages;
    expect(supportedLanguages).toHaveSize(4);
    expect(supportedLanguages.find(lang => lang.code === 'en')).toBeTruthy();
    expect(supportedLanguages.find(lang => lang.code === 'ar')).toBeTruthy();
    expect(supportedLanguages.find(lang => lang.code === 'de')).toBeTruthy();
    expect(supportedLanguages.find(lang => lang.code === 'fr')).toBeTruthy();
  });

  it('should set language and update localStorage', () => {
    const newLanguage: SupportedLanguage = 'ar';
    service.setLanguage(newLanguage);

    expect(service.getCurrentLanguage()).toBe(newLanguage);
    expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', newLanguage);
  });

  it('should emit language change when language is set', (done) => {
    const newLanguage: SupportedLanguage = 'ar';

    service.currentLanguage$.subscribe(language => {
      if (language === newLanguage) {
        expect(language).toBe(newLanguage);
        done();
      }
    });

    service.setLanguage(newLanguage);
  });

  it('should return correct locale for English', () => {
    service.setLanguage('en');
    expect(service.getCurrentLocale()).toBe('en-US');
  });

  it('should return correct locale for Arabic', () => {
    service.setLanguage('ar');
    expect(service.getCurrentLocale()).toBe('ar-SA');
  });

  it('should return correct direction for LTR language', () => {
    service.setLanguage('en');
    expect(service.getDirection()).toBe('ltr');
    expect(service.isRTL()).toBe(false);
  });

  it('should return correct direction for RTL language', () => {
    service.setLanguage('ar');
    expect(service.getDirection()).toBe('rtl');
    expect(service.isRTL()).toBe(true);
  });

  it('should switch between languages', () => {
    service.setLanguage('en');
    service.switchLanguage();
    expect(service.getCurrentLanguage()).toBe('ar');

    service.switchLanguage();
    expect(service.getCurrentLanguage()).toBe('en');
  });

  it('should get current language option', () => {
    service.setLanguage('ar');
    const currentOption = service.getCurrentLanguageOption();

    expect(currentOption.code).toBe('ar');
    expect(currentOption.dir).toBe('rtl');
    expect(currentOption.nativeName).toBe('العربية');
  });

  it('should fallback to default language for unsupported language', () => {
    spyOn(console, 'warn');
    service.setLanguage('fr' as SupportedLanguage);

    expect(service.getCurrentLanguage()).toBe('en');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should restore language from localStorage on initialization', () => {
    mockLocalStorage['selectedLanguage'] = 'ar';

    // Create a new service instance to test initialization
    const newService = new LanguageService();

    expect(newService.getCurrentLanguage()).toBe('ar');
  });

  it('should get translation through service', (done) => {
    const testKey = 'test.key';
    const testValue = 'Test Value';

    spyOn(translateService, 'get').and.returnValue(new Promise(resolve => resolve(testValue)) as any);

    service.getTranslation(testKey).subscribe(value => {
      expect(value).toBe(testValue);
      expect(translateService.get).toHaveBeenCalledWith(testKey, undefined);
      done();
    });
  });

  it('should get instant translation through service', () => {
    const testKey = 'test.key';
    const testValue = 'Test Value';

    spyOn(translateService, 'instant').and.returnValue(testValue);

    const result = service.getInstantTranslation(testKey);
    expect(result).toBe(testValue);
    expect(translateService.instant).toHaveBeenCalledWith(testKey, undefined);
  });

  it('should handle missing localStorage gracefully', () => {
    // Mock localStorage as undefined (SSR scenario)
    // @ts-ignore
    (globalThis as any).localStorage = undefined;

    expect(() => service.setLanguage('ar')).not.toThrow();
  });

  it('should handle missing document gracefully', () => {
    // Mock document as undefined (SSR scenario)
    const originalDocument = globalThis.document;
    // @ts-ignore
    (globalThis as any).document = undefined;

    expect(() => service.setLanguage('ar')).not.toThrow();

    // Restore document
    // @ts-ignore
    (globalThis as any).document = originalDocument;
  });
});
