import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LcpOptimizationService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Optimize LCP by preloading critical images and resources
   */
  optimizeLCP(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove app loader as soon as Angular is ready
    this.removeAppLoader();

    // Ensure hero image is cached
    this.preloadHeroImage();

    // Monitor LCP and provide feedback
    this.monitorLCP();
  }

  private removeAppLoader(): void {
    const loader = document.getElementById('app-loader');
    if (loader) {
      // Remove immediately to prevent blocking
      loader.classList.add('loaded');
      setTimeout(() => loader.remove(), 300);
    }
  }

  private preloadHeroImage(): void {
    // Create hidden image element to force browser caching
    const img = new Image();
    img.fetchPriority = 'high';
    img.decoding = 'sync';
    img.src = 'https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/87991aa4701e3978e0d79a7d8f421a6f.jpg';
  }

  private monitorLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1] as any;

        if (lcpEntry && lcpEntry.startTime) {
          console.log('🎯 LCP Time:', Math.round(lcpEntry.startTime), 'ms');

          if (lcpEntry.startTime > 2500) {
            console.warn('⚠️ LCP is above 2.5s threshold');
          } else {
            console.log('✅ LCP is within good range');
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.log('LCP monitoring not supported');
      }
    }
  }

  /**
   * Preload critical CSS for faster rendering
   */
  injectCriticalCSS(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const criticalCSS = `
      .hero-section { min-height: 100vh; }
      .hero-section img { object-fit: cover; width: 100%; height: 100%; }
      .hero-gradient { background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)); }
      .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    `;

    const style = document.createElement('style');
    style.innerHTML = criticalCSS;
    document.head.appendChild(style);
  }
}
