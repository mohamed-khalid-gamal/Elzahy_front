import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {

  preload(route: Route, fn: () => Observable<any>): Observable<any> {
    // Don't preload routes marked with data.preload = false
    if (route.data?.['preload'] === false) {
      return of(null);
    }

    // Don't preload if user prefers reduced data usage
    if (this.shouldReduceDataUsage()) {
      return of(null);
    }

    // Preload critical routes immediately (only for LCP-critical routes)
    if (route.data?.['preload'] === 'critical') {
      return fn();
    }

    // Preload important routes after network is idle and connection is good
    if (route.data?.['preload'] === 'important') {
      return this.preloadWhenNetworkIdle(fn);
    }

    // Default: preload after connection is idle and system resources are available
    return this.preloadWhenIdle(fn);
  }

  private preloadWhenNetworkIdle(fn: () => Observable<any>): Observable<any> {
    // Check if network is fast enough and user is not on limited data
    if (this.isConnectionGood()) {
      return timer(500).pipe(mergeMap(() => fn()));
    }
    return of(null);
  }

  private preloadWhenIdle(fn: () => Observable<any>): Observable<any> {
    if ('requestIdleCallback' in window) {
      return new Observable(observer => {
        requestIdleCallback(() => {
          fn().subscribe(observer);
        }, { timeout: 5000 });
      });
    }

    // Fallback: preload after 3 seconds
    return timer(3000).pipe(mergeMap(() => fn()));
  }

  /**
   * Check if user prefers reduced data usage
   */
  private shouldReduceDataUsage(): boolean {
    if (typeof navigator === 'undefined') return false;

    // Check for Save-Data header or reduced motion preference
    return (navigator as any).connection?.saveData ||
           window.matchMedia('(prefers-reduced-data: reduce)').matches ||
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private isConnectionGood(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      // Only preload on fast connections
      return connection.effectiveType === '4g' && !connection.saveData;
    }
    return true; // Assume good connection if API not available
  }
}
