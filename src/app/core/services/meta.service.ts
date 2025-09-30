import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  canonicalUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  constructor(
    private meta: Meta,
    private title: Title,
    private translateService: TranslateService,
    private languageService: LanguageService
  ) {}

  updatePageMeta(metaKeys: { titleKey: string; descriptionKey?: string; keywordsKey?: string }): void {
    combineLatest([
      this.translateService.get(metaKeys.titleKey),
      metaKeys.descriptionKey ? this.translateService.get(metaKeys.descriptionKey) : new Observable(subscriber => subscriber.next('')),
      metaKeys.keywordsKey ? this.translateService.get(metaKeys.keywordsKey) : new Observable(subscriber => subscriber.next(''))
    ]).subscribe(([title, description, keywords]) => {
      this.setPageMeta({
        title,
        description,
        keywords
      });
    });
  }

  setPageMeta(tags: MetaTags): void {
    // Update page title
    if (tags.title) {
      this.title.setTitle(tags.title);
    }

    // Update meta description
    if (tags.description) {
      this.meta.updateTag({ name: 'description', content: tags.description });
    }

    // Update meta keywords
    if (tags.keywords) {
      this.meta.updateTag({ name: 'keywords', content: tags.keywords });
    }

    // Update Open Graph tags
    if (tags.ogTitle) {
      this.meta.updateTag({ property: 'og:title', content: tags.ogTitle });
    } else if (tags.title) {
      this.meta.updateTag({ property: 'og:title', content: tags.title });
    }

    if (tags.ogDescription) {
      this.meta.updateTag({ property: 'og:description', content: tags.ogDescription });
    } else if (tags.description) {
      this.meta.updateTag({ property: 'og:description', content: tags.description });
    }

    if (tags.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: tags.ogImage });
    }

    // Update Twitter Card tags
    if (tags.twitterTitle) {
      this.meta.updateTag({ name: 'twitter:title', content: tags.twitterTitle });
    } else if (tags.title) {
      this.meta.updateTag({ name: 'twitter:title', content: tags.title });
    }

    if (tags.twitterDescription) {
      this.meta.updateTag({ name: 'twitter:description', content: tags.twitterDescription });
    } else if (tags.description) {
      this.meta.updateTag({ name: 'twitter:description', content: tags.description });
    }

    // Update language and direction meta tags
    const currentLang = this.languageService.getCurrentLanguage();
    const direction = this.languageService.getDirection();

    this.meta.updateTag({ name: 'language', content: currentLang });
    this.meta.updateTag({ name: 'dir', content: direction });
    this.meta.updateTag({ property: 'og:locale', content: this.languageService.getCurrentLocale() });

    // Add hreflang tags
    this.addHreflangTags();
  }

  private addHreflangTags(): void {
    // Remove existing hreflang <link> tags
    const existing = Array.from(document.head.querySelectorAll('link[rel="alternate"][hreflang]'));
    existing.forEach(el => el.parentElement?.removeChild(el));

    // Add hreflang for each supported language
    const currentUrl = window.location.href.split('?')[0];

    this.languageService.supportedLanguages.forEach(lang => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang.code);
      link.setAttribute('href', currentUrl);
      document.head.appendChild(link);
    });

    // Add x-default hreflang
    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', currentUrl);
    document.head.appendChild(xDefault);
  }

  updateCanonicalUrl(url: string): void {
    // Remove existing canonical tag
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical tag
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  // Predefined meta updates for common pages
  updateHomeMeta(): void {
    this.updatePageMeta({
      titleKey: 'meta.home.title',
      descriptionKey: 'meta.home.description'
    });
  }

  updateProjectsMeta(): void {
    this.updatePageMeta({
      titleKey: 'meta.projects.title',
      descriptionKey: 'meta.projects.description'
    });
  }

  updateAwardsMeta(): void {
    this.updatePageMeta({
      titleKey: 'meta.awards.title',
      descriptionKey: 'meta.awards.description'
    });
  }

  updateAboutMeta(): void {
    this.updatePageMeta({
      titleKey: 'meta.about.title',
      descriptionKey: 'meta.about.description'
    });
  }

  updateContactMeta(): void {
    this.updatePageMeta({
      titleKey: 'meta.contact.title',
      descriptionKey: 'meta.contact.description'
    });
  }
}
