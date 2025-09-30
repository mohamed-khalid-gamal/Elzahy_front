import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() src!: string;
  @Input() srcset?: string;
  @Input() sizes?: string;
  @Input() placeholder?: string;
  @Input() errorSrc: string = '/public/no-image.svg';

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    this.createObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver() {
    const options = {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);

    // Set placeholder initially
    if (this.placeholder) {
      this.el.nativeElement.src = this.placeholder;
    }
  }

  private loadImage() {
    const img = this.el.nativeElement;

    // Create a new image to test loading
    const imageLoader = new Image();

    imageLoader.onload = () => {
      // Image loaded successfully, update the actual img element
      if (this.srcset) {
        img.srcset = this.srcset;
      }
      if (this.sizes) {
        img.sizes = this.sizes;
      }
      img.src = this.src;
      img.classList.add('loaded');
    };

    imageLoader.onerror = () => {
      // Image failed to load, set fallback
      img.src = this.errorSrc || this.placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkwyNCAyNE0yNCAxNkwxNiAyNCIgc3Ryb2tlPSIjOTdhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
      img.classList.add('error');
    };

    // Start loading
    imageLoader.src = this.src;
  }
}
