import { Directive, ElementRef, Input, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string = '';
  @Input() lazySrc: string = '';
  @Input() lazyAlt: string = '';
  @Input() lazyClass: string = 'lazy';
  @Input() loadedClass: string = 'loaded';
  @Input() errorClass: string = 'error';
  @Input() threshold: number = 0.1;
  @Input() rootMargin: string = '50px 0px';
  // New: configurable error fallback, default to local asset
  @Input() errorSrc: string = '/public/no-image.svg';

  private observer?: IntersectionObserver;

  constructor(
    private elementRef: ElementRef<HTMLImageElement>,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // For SSR, set the src immediately
      this.loadImage();
      return;
    }

    // Add lazy class initially
    this.elementRef.nativeElement.classList.add(this.lazyClass);

    // Set up placeholder if not already set
    if (!this.elementRef.nativeElement.src) {
      this.elementRef.nativeElement.src = this.generatePlaceholder();
    }

    // Create intersection observer
    this.createObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private loadImage(): void {
    const img = this.elementRef.nativeElement;
    const src = this.lazySrc || this.appLazyLoad;

    if (!src) return;

    // Create a new image to preload
    const imageLoader = new Image();

    imageLoader.onload = () => {
      // Update the actual image element
      img.src = src;
      if (this.lazyAlt) {
        img.alt = this.lazyAlt;
      }

      // Update classes
      img.classList.remove(this.lazyClass);
      img.classList.add(this.loadedClass);

      // Trigger load event for any listeners
      img.dispatchEvent(new Event('lazyload'));
    };

    imageLoader.onerror = () => {
      // Set local fallback on error to avoid broken external requests
      img.src = this.errorSrc;
      img.classList.add(this.errorClass);
      img.dispatchEvent(new Event('lazyerror'));
    };

    // Start loading
    imageLoader.src = src;
  }

  private generatePlaceholder(): string {
    // Create a simple 1x1 transparent pixel as placeholder
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
  }
}
