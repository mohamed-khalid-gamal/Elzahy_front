import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, style, transition, animate, stagger, query } from '@angular/animations';
import { AwardsService } from '../../services/awards.service';
import { AwardDto } from '../../shared/types/api.types';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-awards-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './awards-section.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerAwards', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-50px)' }),
          stagger(300, [
            animate('800ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AwardsSectionComponent implements OnInit, OnDestroy {
  @Input() isPage = false;

  private destroy$ = new Subject<void>();
  awards: AwardDto[] = [];
  loading = true;
  error: string | null = null;

  constructor(private awardsService: AwardsService) {}

  ngOnInit() {
    this.loadAwards();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAwards() {
    this.loading = true;
    this.error = null;

    // Load only published awards for public access
    this.awardsService.getAwards(true)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading awards:', error);
          this.error = 'Failed to load awards. Please try again later.';
          return of([]);
        })
      )
      .subscribe(awards => {
        this.awards = awards;
        this.loading = false;
      });
  }

  getDisplayAwards(): AwardDto[] {
    return this.isPage ? this.awards : this.awards.slice(0, 4);
  }

  get featuredAwards(): AwardDto[] {
    return this.awards.slice(0, 2);
  }

  /**
   * Get award image URL
   */
  getAwardImageUrl(award: AwardDto): string {
    // If award has imageData, create a data URL
    if (award.imageData && award.imageContentType) {
      return `data:${award.imageContentType};base64,${award.imageData}`;
    }

    // Legacy support: If award has imageUrl, use it
    if (award.imageUrl) {
      return award.imageUrl;
    }

    // Use the service method to get image URL, or return placeholder
    try {
      return this.awardsService.getAwardImageUrl(award.id);
    } catch {
      // Return a placeholder image URL
      return 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Award';
    }
  }

  /**
   * Check if award has an image
   */
  hasImage(award: AwardDto): boolean {
    return !!(award.imageData || award.imageUrl);
  }

  /**
   * Format award date
   */
  formatAwardDate(dateReceived: string): string {
    const date = new Date(dateReceived);
    return date.getFullYear().toString();
  }
}
