import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, map, of } from 'rxjs';

export interface ResponsiveImageConfig {
  src: string;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
  quality?: number;
}

export interface ImageBreakpoint {
  width: number;
  src: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Get optimized image configuration based on current viewport
   */
  getResponsiveImageConfig(baseUrl: string, alt: string, isLCP: boolean = false): Observable<ResponsiveImageConfig> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({
        src: baseUrl,
        alt,
        loading: isLCP ? 'eager' : 'lazy',
        fetchpriority: isLCP ? 'high' : 'auto'
      });
    }

    return of(this.getImageConfigForViewport(baseUrl, alt, isLCP));
  }

  /**
   * Get image configuration based on current viewport size
   */
  private getImageConfigForViewport(baseUrl: string, alt: string, isLCP: boolean): ResponsiveImageConfig {
    const width = window.innerWidth;
    let targetWidth = 1920;
    let quality = 80;

    if (width <= 600) {
      targetWidth = 600;
      quality = 75;
    } else if (width <= 960) {
      targetWidth = 960;
      quality = 78;
    } else if (width <= 1280) {
      targetWidth = 1280;
      quality = 80;
    } else {
      targetWidth = 1920;
      quality = 82;
    }

    const optimizedUrl = this.generateOptimizedUrl(baseUrl, targetWidth, quality);

    return {
      src: optimizedUrl,
      alt,
      sizes: this.generateSizes(),
      loading: isLCP ? 'eager' : 'lazy',
      fetchpriority: isLCP ? 'high' : 'auto',
      quality
    };
  }

  /**
   * Generate optimized URL with compression and sizing parameters
   */
  private generateOptimizedUrl(baseUrl: string, width: number, quality: number): string {
    // For external CDNs like Hostinger, add optimization parameters
    if (baseUrl.includes('hostinger.com') || baseUrl.includes('horizons-cdn')) {
      return `${baseUrl}?w=${width}&q=${quality}&f=webp`;
    }

    // For other URLs, return as-is or apply different logic
    return baseUrl;
  }

  /**
   * Generate responsive sizes attribute
   */
  private generateSizes(): string {
    return '(max-width: 600px) 100vw, (max-width: 960px) 100vw, (max-width: 1280px) 100vw, 100vw';
  }

  /**
   * Create srcset for responsive images
   */
  generateSrcSet(baseUrl: string): string {
    const breakpoints = [600, 960, 1280, 1920];
    const qualities = [75, 78, 80, 82];

    return breakpoints.map((width, index) => {
      const optimizedUrl = this.generateOptimizedUrl(baseUrl, width, qualities[index]);
      return `${optimizedUrl} ${width}w`;
    }).join(', ');
  }

  /**
   * Preload critical images for LCP optimization
   */
  preloadCriticalImage(url: string): void {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    }
  }

  /**
   * Optimize image loading with intersection observer
   */
  setupLazyLoading(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset['src']) {
              img.src = img.dataset['src'];
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observer all lazy images
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}
