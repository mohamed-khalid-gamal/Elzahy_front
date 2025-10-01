import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, SupportedLanguage, LanguageOption } from '../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="relative overflow-visible" data-cy="language-switcher">
      <!-- Language Toggle Button -->
      <button
        (click)="toggleDropdown()"
        class="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-white/20 hover:text-white transition-all duration-300"
        [attr.aria-label]="'language.switch' | translate"
        [attr.aria-expanded]="isDropdownOpen"
        [attr.aria-haspopup]="true"
        data-cy="language-toggle-button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
        </svg>
        <span class="hidden sm:inline">{{ currentLanguageOption.nativeName }}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          [class.rotate-180]="isDropdownOpen"
          class="transition-transform duration-200"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div
        *ngIf="isDropdownOpen"
        class="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 z-[100]"
        style="max-height: none; overflow: visible;"
        [attr.data-animation]="'slideIn'"
      >
        <div class="py-2">
          <button
            *ngFor="let language of languageService.supportedLanguages"
            (click)="selectLanguage(language.code)"
            class="w-full text-left px-4 py-2 hover:bg-gray-100/50 transition-colors duration-200 flex items-center justify-between"
            [class.bg-gray-100/30]="language.code === currentLanguage"
            [attr.data-cy]="'language-option-' + language.code"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">{{ getLanguageFlag(language.code) }}</span>
              <div>
                <div class="font-medium text-gray-800">{{ language.nativeName }}</div>
                <div class="text-xs text-gray-600">{{ language.name }}</div>
              </div>
            </div>
            <div
              *ngIf="language.code === currentLanguage"
              class="w-2 h-2 bg-blue-500 rounded-full"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop to close dropdown -->
    <div
      *ngIf="isDropdownOpen"
      class="fixed inset-0 z-40"
      (click)="closeDropdown()"
    ></div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    [data-animation="slideIn"] {
      animation: slideIn 0.2s ease-out;
    }
  `],
  animations: [
    // You can add Angular animations here if preferred
  ]
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  isDropdownOpen = false;
  currentLanguage: SupportedLanguage = 'en';
  currentLanguageOption: LanguageOption;
  private subscription: Subscription = new Subscription();

  constructor(public languageService: LanguageService) {
    this.currentLanguageOption = this.languageService.getCurrentLanguageOption();
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.subscription.add(
      this.languageService.currentLanguage$.subscribe(language => {
        this.currentLanguage = language;
        this.currentLanguageOption = this.languageService.getCurrentLanguageOption();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  selectLanguage(language: SupportedLanguage): void {
    this.languageService.setLanguage(language);
    this.closeDropdown();
  }

  getLanguageFlag(language: SupportedLanguage): string {
    const flags: Record<SupportedLanguage, string> = {
      'en': '🇺🇸',
      'ar': '🇸🇦',
      'de': '🇩🇪',
      'fr': '🇫🇷'
    };
    return flags[language] || '🌐';
  }
}
