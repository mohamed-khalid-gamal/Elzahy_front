import { Directive, ElementRef, Input, OnInit, Renderer2, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit {
  @Input('appLazyImage') lazySrc!: string;
  @Input() placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
  @Input() errorSrc = '/public/no-image.svg';
  @Input() isLCP = false;

  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // For SSR, set the image source directly
      this.loadImage();
      return;
    }

    const img = this.el.nativeElement;

    // Set placeholder initially
    this.renderer.setAttribute(img, 'src', this.placeholder);
    this.renderer.addClass(img, 'lazy-loading');

    // If it's LCP image, load immediately
    if (this.isLCP) {
      this.loadImage();
      return;
    }

    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    const img = this.el.nativeElement;

    // Create a new image to preload
    const imageLoader = new Image();

    imageLoader.onload = () => {
      // Image loaded successfully
      this.renderer.setAttribute(img, 'src', this.lazySrc);
      this.renderer.removeClass(img, 'lazy-loading');
      this.renderer.addClass(img, 'lazy-loaded');

      // Add fade-in effect
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        img.style.opacity = '1';
      }, 10);
    };

    imageLoader.onerror = () => {
      // Error loading image, use error placeholder
      this.renderer.setAttribute(img, 'src', this.errorSrc);
      this.renderer.removeClass(img, 'lazy-loading');
      this.renderer.addClass(img, 'lazy-error');
    };

    // Start loading the image
    imageLoader.src = this.lazySrc;
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
