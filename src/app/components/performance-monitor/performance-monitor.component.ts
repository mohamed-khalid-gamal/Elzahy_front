import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
}

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showMetrics" class="performance-monitor">
      <h4>Performance Metrics</h4>
      <div class="metrics">
        <div *ngIf="metrics.fcp" class="metric">
          <span>FCP:</span> {{ metrics.fcp }}ms
          <span [class]="getScoreClass('fcp', metrics.fcp)">{{ getScore('fcp', metrics.fcp) }}</span>
        </div>
        <div *ngIf="metrics.lcp" class="metric">
          <span>LCP:</span> {{ metrics.lcp }}ms
          <span [class]="getScoreClass('lcp', metrics.lcp)">{{ getScore('lcp', metrics.lcp) }}</span>
        </div>
        <div *ngIf="metrics.cls" class="metric">
          <span>CLS:</span> {{ metrics.cls }}
          <span [class]="getScoreClass('cls', metrics.cls)">{{ getScore('cls', metrics.cls) }}</span>
        </div>
        <div *ngIf="metrics.fid" class="metric">
          <span>FID:</span> {{ metrics.fid }}ms
          <span [class]="getScoreClass('fid', metrics.fid)">{{ getScore('fid', metrics.fid) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .performance-monitor {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 9999;
      min-width: 150px;
    }

    .metrics {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .good { color: #4ade80; }
    .needs-improvement { color: #fbbf24; }
    .poor { color: #f87171; }

    @media (max-width: 768px) {
      .performance-monitor {
        display: none;
      }
    }
  `]
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  metrics: PerformanceMetrics = {};
  showMetrics = false;
  private observers: PerformanceObserver[] = [];

  ngOnInit() {
    // Only show in development or with query parameter
    this.showMetrics = !this.isProduction() || this.hasDebugParam();

    if (this.showMetrics) {
      this.initializePerformanceMonitoring();
    }
  }

  ngOnDestroy() {
    this.observers.forEach(observer => observer.disconnect());
  }

  private isProduction(): boolean {
    return location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
  }

  private hasDebugParam(): boolean {
    return new URLSearchParams(location.search).has('debug');
  }

  private initializePerformanceMonitoring() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Monitor FCP and LCP
    this.observePaintMetrics();

    // Monitor CLS
    this.observeLayoutShifts();

    // Monitor FID
    this.observeFirstInputDelay();

    // Monitor TTFB
    this.measureTTFB();
  }

  private observePaintMetrics() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = Math.round(entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Paint metrics not supported');
    }

    // LCP
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = Math.round(lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('LCP metrics not supported');
    }
  }

  private observeLayoutShifts() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.cls = Math.round(clsValue * 1000) / 1000;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('CLS metrics not supported');
    }
  }

  private observeFirstInputDelay() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          if (fidEntry.processingStart) {
            this.metrics.fid = Math.round(fidEntry.processingStart - fidEntry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FID metrics not supported');
    }
  }

  private measureTTFB() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
      if (navigationEntry) {
        this.metrics.ttfb = Math.round(navigationEntry.responseStart - navigationEntry.requestStart);
      }
    }
  }

  getScore(metric: string, value: number): string {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return '';

    if (value <= threshold.good) return 'Good';
    if (value <= threshold.poor) return 'OK';
    return 'Poor';
  }

  getScoreClass(metric: string, value: number): string {
    const score = this.getScore(metric, value);
    return score.toLowerCase().replace(' ', '-');
  }
}
