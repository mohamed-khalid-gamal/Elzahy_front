import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, BehaviorSubject, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ImageCacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  expiresAt: number;
}

export interface OptimizedImageResult {
  src: string;
  srcset?: string;
  sizes?: string;
  loading: 'lazy' | 'eager';
  fetchpriority: 'high' | 'low' | 'auto';
  cached: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnhancedImageOptimizationService {
  private imageCache = new Map<string, ImageCacheEntry>();
  private cacheSize = 0;
  private readonly maxCacheSize = 50 * 1024 * 1024; // 50MB
  private readonly cacheExpiry = 30 * 60 * 1000; // 30 minutes

  private loadingStates = new Map<string, BehaviorSubject<boolean>>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCache();
    }
  }

  /**
   * Get optimized image with caching and fallback handling
   */
  getOptimizedImage(
    imageUrl: string,
    alt: string,
    isLCP: boolean = false,
    fallbackUrls: string[] = []
  ): Observable<OptimizedImageResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({
        src: imageUrl,
        loading: isLCP ? 'eager' : 'lazy',
        fetchpriority: isLCP ? 'high' : 'auto',
        cached: false
      });
    }

    return this.loadImageWithFallback(imageUrl, fallbackUrls).pipe(
      map(finalUrl => ({
        src: finalUrl,
        srcset: this.generateSrcSet(finalUrl),
        sizes: this.generateSizes(),
        loading: isLCP ? 'eager' : 'lazy' as 'lazy' | 'eager',
        fetchpriority: isLCP ? 'high' : 'auto' as 'high' | 'low' | 'auto',
        cached: this.isImageCached(finalUrl)
      })),
      catchError(() => of({
        src: '/no-image.svg',
        loading: 'lazy' as 'lazy' | 'eager',
        fetchpriority: 'auto' as 'high' | 'low' | 'auto',
        cached: false
      }))
    );
  }

  /**
   * Load image with fallback URLs
   */
  private loadImageWithFallback(primaryUrl: string, fallbackUrls: string[]): Observable<string> {
    const urlsToTry = [primaryUrl, ...fallbackUrls, '/no-image.svg'];

    return from(this.tryLoadingUrls(urlsToTry));
  }

  /**
   * Try loading URLs sequentially until one succeeds
   */
  private async tryLoadingUrls(urls: string[]): Promise<string> {
    for (const url of urls) {
      try {
        await this.preloadImage(url);
        console.log(`✅ Successfully loaded image: ${url}`);
        return url;
      } catch (error) {
        console.warn(`❌ Failed to load image: ${url}`, error);
        continue;
      }
    }

    // If all fail, return the last fallback
    return urls[urls.length - 1] || '/no-image.svg';
  }

  /**
   * Preload image and cache it
   */
  private preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (this.isImageCached(url)) {
        const cachedEntry = this.imageCache.get(url);
        if (cachedEntry && !this.isCacheExpired(cachedEntry)) {
          const img = new Image();
          img.src = URL.createObjectURL(cachedEntry.blob);
          resolve(img);
          return;
        } else {
          this.removeFromCache(url);
        }
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        this.cacheImage(url, img).then(() => resolve(img));
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Set a timeout for image loading
      setTimeout(() => {
        reject(new Error(`Image load timeout: ${url}`));
      }, 10000);

      img.src = url;
    });
  }

  /**
   * Cache image blob
   */
  private async cacheImage(url: string, img: HTMLImageElement): Promise<void> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx?.drawImage(img, 0, 0);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const entry: ImageCacheEntry = {
              url,
              blob,
              timestamp: Date.now(),
              expiresAt: Date.now() + this.cacheExpiry
            };

            // Clean cache if needed
            this.cleanCacheIfNeeded(blob.size);

            this.imageCache.set(url, entry);
            this.cacheSize += blob.size;

            console.log(`📦 Cached image: ${url} (${this.formatBytes(blob.size)})`);
          }
          resolve();
        }, 'image/jpeg', 0.8);
      });
    } catch (error) {
      console.warn(`Failed to cache image: ${url}`, error);
    }
  }

  /**
   * Check if image is cached and not expired
   */
  private isImageCached(url: string): boolean {
    const entry = this.imageCache.get(url);
    return entry ? !this.isCacheExpired(entry) : false;
  }

  /**
   * Check if cache entry is expired
   */
  private isCacheExpired(entry: ImageCacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Clean cache if it exceeds size limit
   */
  private cleanCacheIfNeeded(newItemSize: number): void {
    if (this.cacheSize + newItemSize > this.maxCacheSize) {
      // Remove oldest entries first
      const sortedEntries = Array.from(this.imageCache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp);

      let freedSpace = 0;
      const targetSpace = newItemSize + (this.maxCacheSize * 0.1); // Free 10% extra

      for (const [url, entry] of sortedEntries) {
        this.removeFromCache(url);
        freedSpace += entry.blob.size;

        if (freedSpace >= targetSpace) {
          break;
        }
      }

      console.log(`🧹 Cleaned cache, freed ${this.formatBytes(freedSpace)}`);
    }
  }

  /**
   * Remove item from cache
   */
  private removeFromCache(url: string): void {
    const entry = this.imageCache.get(url);
    if (entry) {
      this.cacheSize -= entry.blob.size;
      this.imageCache.delete(url);
    }
  }

  /**
   * Generate responsive srcset
   */
  private generateSrcSet(baseUrl: string): string {
    if (baseUrl === '/no-image.svg') return '';

    const breakpoints = [480, 768, 1024, 1280, 1920];
    return breakpoints
      .map(width => `${this.addSizeParam(baseUrl, width)} ${width}w`)
      .join(', ');
  }

  /**
   * Generate sizes attribute
   */
  private generateSizes(): string {
    return '(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }

  /**
   * Add size parameter to URL
   */
  private addSizeParam(url: string, width: number): string {
    if (url.includes('?')) {
      return `${url}&w=${width}`;
    }
    return `${url}?w=${width}`;
  }

  /**
   * Initialize cache from localStorage
   */
  private initializeCache(): void {
    try {
      const cached = localStorage.getItem('imageCache');
      if (cached) {
        const data = JSON.parse(cached);
        // Note: We can't restore blobs from localStorage, so we'll start fresh
        console.log('🔄 Image cache initialized');
      }
    } catch (error) {
      console.warn('Failed to initialize image cache', error);
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: string; count: number; hitRate: number } {
    return {
      size: this.formatBytes(this.cacheSize),
      count: this.imageCache.size,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }

  /**
   * Clear all cached images
   */
  clearCache(): void {
    this.imageCache.clear();
    this.cacheSize = 0;
    console.log('🗑️ Image cache cleared');
  }
}
