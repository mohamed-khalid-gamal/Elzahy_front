import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingService {

  /**
   * Create an intersection observer for lazy loading images
   */
  createImageObserver(callback: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver {
    const options = {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0.1
    };

    return new IntersectionObserver(callback, options);
  }

  /**
   * Lazy load images with srcset support
   */
  lazyLoadImage(
    img: HTMLImageElement,
    src: string,
    srcset?: string,
    sizes?: string
  ): void {
    if (srcset) {
      img.srcset = srcset;
    }
    if (sizes) {
      img.sizes = sizes;
    }
    img.src = src;
    img.classList.remove('lazy');
    img.classList.add('loaded');
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(urls: string[]): Promise<void[]> {
    const preloadPromises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    });

    return Promise.all(preloadPromises);
  }

  /**
   * Optimize image URL for better performance
   */
  optimizeImageUrl(
    baseUrl: string,
    width?: number,
    quality: number = 75,
    format: string = 'auto'
  ): string {
    // For Unsplash images
    if (baseUrl.includes('unsplash.com')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      params.set('q', quality.toString());
      params.set('auto', format);
      return `${baseUrl}?${params.toString()}`;
    }

    // For other CDN images, return as-is or apply specific optimizations
    return baseUrl;
  }

  /**
   * Generate responsive image srcset
   */
  generateSrcSet(baseUrl: string, widths: number[] = [400, 800, 1200, 1600]): string {
    if (baseUrl.includes('unsplash.com')) {
      return widths
        .map(width => `${this.optimizeImageUrl(baseUrl, width)} ${width}w`)
        .join(', ');
    }

    return '';
  }

  /**
   * Debounce function for scroll events
   */
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  }
}
