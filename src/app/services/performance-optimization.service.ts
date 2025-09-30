import { Injectable } from '@angular/core';

export interface PerformanceMetrics {
  lcp?: number;
  fcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceOptimizationService {

  private metrics: PerformanceMetrics = {};

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor LCP (Largest Contentful Paint)
    this.observeLCP();

    // Monitor FCP (First Contentful Paint)
    this.observeFCP();

    // Monitor CLS (Cumulative Layout Shift)
    this.observeCLS();

    // Monitor FID (First Input Delay)
    this.observeFID();

    // Monitor TTFB (Time to First Byte)
    this.observeTTFB();
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.startTime;
          console.log('LCP:', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported');
      }
    }
  }

  /**
   * Observe First Contentful Paint
   */
  private observeFCP(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              console.log('FCP:', entry.startTime);
            }
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observation not supported');
      }
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS(): void {
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.cls = clsValue;
          console.log('CLS:', clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported');
      }
    }
  }

  /**
   * Observe First Input Delay
   */
  private observeFID(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.fid = (entry as any).processingStart - entry.startTime;
            console.log('FID:', this.metrics.fid);
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported');
      }
    }
  }

  /**
   * Observe Time to First Byte
   */
  private observeTTFB(): void {
    if (typeof window !== 'undefined' && window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
          console.log('TTFB:', this.metrics.ttfb);
        }
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Optimize resource loading order
   */
  optimizeResourceLoading(): void {
    if (typeof document === 'undefined') return;

    // Preload critical resources, but avoid duplicates
    this.preloadCriticalResources();

    // Defer non-critical scripts
    this.deferNonCriticalScripts();

    // Optimize font loading
    this.optimizeFontLoading();
  }

  /**
   * Preload critical resources
   */
  private preloadCriticalResources(): void {
    const criticalResources = [
      { href: '/styles.css', as: 'style' as const },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' as const }
    ];

    const hasLink = (rel: string, href: string) => !!document.head.querySelector(`link[rel="${rel}"][href="${href}"]`);

    criticalResources.forEach(resource => {
      // Skip if a stylesheet or preload link already exists for this resource (to prevent warnings)
      if (hasLink('stylesheet', resource.href) || hasLink('preload', resource.href)) {
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === 'style') {
        link.onload = () => {
          link.rel = 'stylesheet';
        };
      }
      document.head.appendChild(link);
    });
  }

  /**
   * Defer non-critical scripts
   */
  private deferNonCriticalScripts(): void {
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      script.setAttribute('defer', '');
    });
  }

  /**
   * Optimize font loading
   */
  private optimizeFontLoading(): void {
    // Add font-display: swap to improve FCP
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup intersection observer for lazy loading
   */
  setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          element.classList.add('loaded');
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observe elements with defer-load class
    document.querySelectorAll('.defer-load').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Report performance metrics to analytics
   */
  reportMetrics(): void {
    // Wait for page to be fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = this.getMetrics();
        console.log('Performance Metrics:', metrics);

        // Here you could send metrics to your analytics service
        // Example: analytics.track('performance', metrics);
      }, 1000);
    });
  }
}
