import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  constructor(private router: Router) {
    // Subscribe to router events to ensure scroll to top on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop();
      });
  }

  /**
   * Scrolls to the top of the page
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  /**
   * Scrolls to a specific element by ID
   * @param elementId - The ID of the element to scroll to
   */
  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Scrolls to a specific position
   * @param top - The top position to scroll to
   * @param behavior - The scroll behavior ('smooth' or 'auto')
   */
  scrollToPosition(top: number, behavior: 'smooth' | 'auto' = 'smooth'): void {
    window.scrollTo({ top, left: 0, behavior });
  }
}
