import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  /**
   * Prefetch DNS for external domains
   */
  prefetchDNS(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  /**
   * Preconnect to external domains
   */
  preconnect(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  /**
   * Dynamically import components for code splitting
   */
  async loadComponent(componentPath: string): Promise<any> {
    try {
      const module = await import(componentPath);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load component: ${componentPath}`, error);
      throw error;
    }
  }

  /**
   * Implement requestIdleCallback for non-critical tasks
   */
  runWhenIdle(callback: () => void): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(callback, 0);
    }
  }

  /**
   * Monitor and log Core Web Vitals
   */
  measureCoreWebVitals(): void {
    // Only measure in browser environment
    if (typeof window === 'undefined') return;

    // FCP - First Contentful Paint
    this.measureFCP();

    // LCP - Largest Contentful Paint
    this.measureLCP();

    // CLS - Cumulative Layout Shift
    this.measureCLS();

    // FID - First Input Delay
    this.measureFID();
  }

  private measureFCP(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              console.log(`FCP: ${entry.startTime}ms`);
            }
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('Failed to observe FCP:', e);
      }
    }
  }

  private measureLCP(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log(`LCP: ${entry.startTime}ms`);
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('Failed to observe LCP:', e);
      }
    }
  }

  private measureCLS(): void {
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          console.log(`CLS: ${clsValue}`);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Failed to observe CLS:', e);
      }
    }
  }

  private measureFID(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any;
            if (fidEntry.processingStart) {
              console.log(`FID: ${fidEntry.processingStart - fidEntry.startTime}ms`);
            }
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('Failed to observe FID:', e);
      }
    }
  }

  /**
   * Cache resources in memory for faster access
   */
  private resourceCache = new Map<string, any>();

  cacheResource(key: string, resource: any): void {
    this.resourceCache.set(key, resource);
  }

  getCachedResource<T>(key: string): T | undefined {
    return this.resourceCache.get(key);
  }

  /**
   * Reduce animation frequency when not in focus
   */
  optimizeAnimations(): void {
    let rafId: number | undefined;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (!isVisible && rafId) {
        cancelAnimationFrame(rafId);
        rafId = undefined;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
}
