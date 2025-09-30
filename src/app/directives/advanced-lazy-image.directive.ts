import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAdvancedLazyImage]',
  standalone: true
})
export class AdvancedLazyImageDirective implements OnInit, OnDestroy {
  @Input('appAdvancedLazyImage') lazySrc!: string;
  @Input() fallbackSrc = '/no-image.svg';
  @Input() placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjNEE1NTY4Ii8+PHRleHQgeD0iNSIgeT0iNSIgZm9udC1zaXplPSI4IiBmaWxsPSIjOURBMUFGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Li4uPC90ZXh0Pjwvc3ZnPgo=';
  @Input() isLCP = false;
  @Input() retryCount = 3;
  @Input() retryDelay = 1000;

  private observer?: IntersectionObserver;
  private retryAttempts = 0;
  private img: HTMLImageElement;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.img = this.el.nativeElement;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // For SSR, set the image source directly
      this.loadImage();
      return;
    }

    // Set initial placeholder
    this.setPlaceholder();

    // If it's LCP image, load immediately
    if (this.isLCP) {
      this.loadImage();
      return;
    }

    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setPlaceholder(): void {
    this.renderer.setAttribute(this.img, 'src', this.placeholder);
    this.renderer.addClass(this.img, 'lazy-loading');
    this.renderer.setStyle(this.img, 'filter', 'blur(5px)');
    this.renderer.setStyle(this.img, 'transition', 'filter 0.3s ease');
  }

  private setupIntersectionObserver(): void {
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
            this.observer?.unobserve(this.img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    this.observer.observe(this.img);
  }

  private loadImage(): void {
    const newImg = new Image();

    newImg.onload = () => {
      this.renderer.setAttribute(this.img, 'src', this.lazySrc);
      this.renderer.removeClass(this.img, 'lazy-loading');
      this.renderer.addClass(this.img, 'lazy-loaded');
      this.renderer.removeStyle(this.img, 'filter');
      console.log(`✅ Advanced lazy image loaded: ${this.lazySrc}`);
    };

    newImg.onerror = () => {
      console.warn(`❌ Failed to load image: ${this.lazySrc} (attempt ${this.retryAttempts + 1})`);
      this.handleLoadError();
    };

    newImg.src = this.lazySrc;
  }

  private handleLoadError(): void {
    this.retryAttempts++;

    if (this.retryAttempts < this.retryCount) {
      // Retry after delay
      setTimeout(() => {
        console.log(`🔄 Retrying image load: ${this.lazySrc} (attempt ${this.retryAttempts + 1})`);
        this.loadImage();
      }, this.retryDelay * this.retryAttempts);
    } else {
      // Use fallback image
      console.log(`🔄 Using fallback image: ${this.fallbackSrc}`);
      this.renderer.setAttribute(this.img, 'src', this.fallbackSrc);
      this.renderer.removeClass(this.img, 'lazy-loading');
      this.renderer.addClass(this.img, 'lazy-error');
      this.renderer.removeStyle(this.img, 'filter');
      this.renderer.setStyle(this.img, 'opacity', '0.7');
    }
  }
}
