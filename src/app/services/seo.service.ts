import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SEO_CONSTANTS } from '../constants/seo.constants';
import { environment } from '../../environments/environment';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  type?: string;
  image?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private defaultSEO: SEOData = {
    title: SEO_CONSTANTS.DEFAULT_TITLE,
    description: SEO_CONSTANTS.DEFAULT_DESCRIPTION,
    keywords: SEO_CONSTANTS.DEFAULT_KEYWORDS,
    author: SEO_CONSTANTS.COMPANY_NAME,
    type: 'website',
    image: SEO_CONSTANTS.DEFAULT_OG_IMAGE,
    url: SEO_CONSTANTS.BASE_URL,
    siteName: SEO_CONSTANTS.COMPANY_NAME,
    locale: 'en_US',
    twitterCard: 'summary_large_image',
    twitterSite: SEO_CONSTANTS.TWITTER_HANDLE,
    twitterCreator: SEO_CONSTANTS.TWITTER_HANDLE
  };

  constructor(
    private meta: Meta,
    private titleService: Title,
    private router: Router
  ) {
    // Set default SEO on route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSEOForRoute(event.url);
      });
  }

  updateSEO(seoData: Partial<SEOData>) {
    const data = { ...this.defaultSEO, ...seoData };

    // Update page title
    this.titleService.setTitle(data.title || this.defaultSEO.title!);

    // Update basic meta tags
    this.updateOrCreateTag('description', data.description);
    this.updateOrCreateTag('keywords', data.keywords);
    this.updateOrCreateTag('author', data.author);
    this.updateOrCreateTag('robots', 'index, follow');
    this.updateOrCreateTag('viewport', 'width=device-width, initial-scale=1');

    // Update Open Graph tags
    this.updateOrCreateTag('og:title', data.title, 'property');
    this.updateOrCreateTag('og:description', data.description, 'property');
    this.updateOrCreateTag('og:type', data.type, 'property');
    this.updateOrCreateTag('og:image', data.image, 'property');
    this.updateOrCreateTag('og:url', data.url, 'property');
    this.updateOrCreateTag('og:site_name', data.siteName, 'property');
    this.updateOrCreateTag('og:locale', data.locale, 'property');

    // Update Twitter Card tags
    this.updateOrCreateTag('twitter:card', data.twitterCard, 'name');
    this.updateOrCreateTag('twitter:site', data.twitterSite, 'name');
    this.updateOrCreateTag('twitter:creator', data.twitterCreator, 'name');
    this.updateOrCreateTag('twitter:title', data.title, 'name');
    this.updateOrCreateTag('twitter:description', data.description, 'name');
    this.updateOrCreateTag('twitter:image', data.image, 'name');

    // Update canonical link
    this.updateCanonicalUrl(data.url || this.defaultSEO.url!);
  }

  private updateOrCreateTag(name: string, content?: string, attribute: string = 'name') {
    if (!content) return;

    const selector = `${attribute}="${name}"`;
    const existingTag = this.meta.getTag(selector);

    if (existingTag) {
      this.meta.updateTag({ [attribute]: name, content });
    } else {
      this.meta.addTag({ [attribute]: name, content });
    }
  }

  private updateCanonicalUrl(url: string) {
    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  private updateSEOForRoute(url: string) {
    const fullUrl = `${SEO_CONSTANTS.BASE_URL}${url}`;

    switch (url) {
      case '/':
      case '/home':
        this.updateSEO({
          ...SEO_CONSTANTS.PAGES.HOME,
          url: SEO_CONSTANTS.BASE_URL
        });
        break;

      case '/about':
        this.updateSEO({
          ...SEO_CONSTANTS.PAGES.ABOUT,
          url: `${SEO_CONSTANTS.BASE_URL}/about`
        });
        break;

      case '/projects':
        this.updateSEO({
          ...SEO_CONSTANTS.PAGES.PROJECTS,
          url: `${SEO_CONSTANTS.BASE_URL}/projects`
        });
        break;

      case '/awards':
        this.updateSEO({
          ...SEO_CONSTANTS.PAGES.AWARDS,
          url: `${SEO_CONSTANTS.BASE_URL}/awards`
        });
        break;

      case '/contact':
        this.updateSEO({
          ...SEO_CONSTANTS.PAGES.CONTACT,
          url: `${SEO_CONSTANTS.BASE_URL}/contact`
        });
        break;

      default:
        if (url.startsWith('/project-details/')) {
          // Project details page - will be updated by component
          return;
        }
        // Use default SEO for unknown routes
        this.updateSEO({ url: fullUrl });
        break;
    }
  }

  // Method for updating project-specific SEO
  updateProjectSEO(project: any) {
    this.updateSEO({
      title: `${project.name} - ${SEO_CONSTANTS.COMPANY_NAME} Project`,
      description: project.description || `Discover ${project.name}, a premium property by ${SEO_CONSTANTS.COMPANY_NAME} showcasing our excellence in real estate development.`,
      keywords: `${project.name}, ${SEO_CONSTANTS.COMPANY_NAME} property, real estate, luxury property, property development`,
      url: `${SEO_CONSTANTS.BASE_URL}/project-details/${project.id}`,
      image: this.constructImageUrl(project.mainImage?.imageUrl || (project.images && project.images.length > 0 ? project.images[0].imageUrl : this.defaultSEO.image))
    });
  }

  // Method for generating JSON-LD structured data
  generateOrganizationStructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": SEO_CONSTANTS.COMPANY_NAME,
      "description": SEO_CONSTANTS.DEFAULT_DESCRIPTION,
      "url": SEO_CONSTANTS.BASE_URL,
      "logo": SEO_CONSTANTS.LOGO_URL,
      "image": SEO_CONSTANTS.DEFAULT_OG_IMAGE,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "url": `${SEO_CONSTANTS.BASE_URL}/contact`
      },
      "sameAs": [
        SEO_CONSTANTS.FACEBOOK_URL,
        SEO_CONSTANTS.LINKEDIN_URL,
        `https://twitter.com/${SEO_CONSTANTS.TWITTER_HANDLE.replace('@', '')}`
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Country"
      },
      "foundingDate": SEO_CONSTANTS.FOUNDED_YEAR,
      "industry": SEO_CONSTANTS.INDUSTRY,
      "numberOfEmployees": SEO_CONSTANTS.EMPLOYEE_COUNT,
      "services": SEO_CONSTANTS.SERVICES
    };

    this.addStructuredDataToHead(structuredData);
  }

  private addStructuredDataToHead(data: any) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Construct absolute image URL for production or relative URL for development
   */
  private constructImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return this.defaultSEO.image || '/public/no-image.svg';
    }

    // If already absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // In production, always use absolute URLs
    if (environment.production) {
      const baseUrl = 'https://elzahygroupback.premiumasp.net';
      return `${baseUrl}${imageUrl}`;
    }

    // In development, use relative URLs
    return imageUrl;
  }
}
