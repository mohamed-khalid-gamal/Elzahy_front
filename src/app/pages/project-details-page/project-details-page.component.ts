import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { ProjectsService } from '../../services/projects.service';
import { ProjectDto, ProjectStatus, ProjectImageDto } from '../../shared/types/api.types';
import { ImageGalleryComponent } from '../../shared/components/image-gallery/image-gallery.component';

import { SeoService } from '../../services/seo.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-project-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageGalleryComponent, TranslateModule],
  templateUrl: './project-details-page.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class ProjectDetailsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  project: ProjectDto | null = null;
  loading = true;
  error: string | null = null;
  relatedProjects: ProjectDto[] = [];
  currentProjectId: string | null = null;
  private seoService = inject(SeoService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private titleService: Title,
    private metaService: Meta,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const projectId = params['id'];
      this.currentProjectId = projectId;
      if (projectId && projectId !== 'undefined' && projectId !== 'null') {
        this.loadProject(projectId);
      } else {
        this.error = this.translate.instant('projectDetails.errors.invalidId');
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProject(id: string) {
    this.loading = true;
    this.error = null;

    this.projectsService.getPublicProject(id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading project:', error);
          this.error = this.translate.instant('projectDetails.errors.loadFailed');
          return of(null);
        })
      )
      .subscribe(project => {
        if (project) {
          this.project = project;
          this.updatePageMeta();
          this.loadRelatedProjects();
        } else {
          this.error = this.translate.instant('projectDetails.errors.notFound');
          this.titleService.setTitle(this.translate.instant('projectDetails.errors.titleNotFound'));
        }
        this.loading = false;
      });
  }

  loadRelatedProjects() {
    if (!this.project) return;

    // Load other published projects with the same status and construction type
    const filters = {
      status: this.project.status,
      isPublished: true,
      propertyType: this.project.propertyType,
      pageSize: 4 // Get 4 to filter out current project and show 3
    };

    this.projectsService.getProjects(filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of({ data: [], totalCount: 0, pageNumber: 1, pageSize: 4, totalPages: 0, hasPrevious: false, hasNext: false }))
      )
      .subscribe(response => {
        // Filter out current project and limit to 3 related projects
        this.relatedProjects = response.data
          .filter(p => p.id !== this.project?.id)
          .slice(0, 3);
      });
  }

  getProjectImageUrl(project: ProjectDto): string {
    // First, try to get the main image from the new images array (File System Storage)
    if (project.mainImage && project.mainImage.imageUrl) {
      return this.getImageUrl(project.mainImage);
    }

    // If no main image, try to get the first image from the images array
    if (project.images && project.images.length > 0) {
      const firstImage = project.images[0];
      if (firstImage.imageUrl) {
        return this.getImageUrl(firstImage);
      }
    }

    // If no images, try to get the first video thumbnail
    if (project.videos && project.videos.length > 0) {
      const firstVideo = project.videos[0];
      if (firstVideo.videoUrl) {
        return this.getVideoThumbnail(firstVideo);
      }
    }

    // Legacy support: If project has photoUrl, use it
    if (project.photoUrl) {
      return this.constructImageUrl(project.photoUrl);
    }

    // Return a local fallback image to avoid external requests
    return '/public/no-image.svg';
  }

  /**
   * Get proper image URL using the same logic as admin component
   */
  getImageUrl(image: any): string {
    if (!image) return '/public/no-image.svg';

    if (image.imageUrl) {
      // Absolute URL
      if (image.imageUrl.startsWith('http://') || image.imageUrl.startsWith('https://')) {
        return image.imageUrl;
      }
      // Relative or GUID
      return this.constructImageUrl(image.imageUrl);
    }

    if (image.id) {
      return this.projectsService.getImageUrl(image.id);
    }

    return '/public/no-image.svg';
  }



  /**
   * Construct proper image URL from backend response
   */
  private constructImageUrl(imageUrl: string): string {
    if (!imageUrl) return '/public/no-image.svg';

    // If already absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // In production, always use absolute URLs
    if (environment.production) {
      const baseUrl = 'https://elzahygroupback.premiumasp.net';

      // Handle absolute paths
      if (imageUrl.startsWith('/')) {
        return `${baseUrl}${imageUrl}`;
      }

      // Handle GUID or relative paths
      return `${baseUrl}/api/projects/images/${imageUrl}`;
    }

    // In development, use relative URLs
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    return `/api/projects/images/${imageUrl}`;
  }

  /**
   * Construct proper video URL from backend response
   */
  private constructVideoUrl(videoUrl: string): string {
    return this.projectsService.constructVideoUrl(videoUrl);
  }

  /**
   * Check if project has multiple images
   */
  hasMultipleImages(project: ProjectDto): boolean {
    return project.images ? project.images.length > 1 : false;
  }

  /**
   * Get image count for a project
   */
  getImageCount(project: ProjectDto): number {
    return project.images ? project.images.length : 0;
  }

  /**
   * Check if project has videos
   */
  hasVideos(project: ProjectDto): boolean {
    return project.videos ? project.videos.length > 0 : false;
  }

  /**
   * Get video count for a project
   */
  getVideoCount(project: ProjectDto): number {
    return project.videos ? project.videos.length : 0;
  }

  /**
   * Get all images for gallery
   */
  getProjectImages(project: ProjectDto): { url: string; alt: string }[] {
    if (!project.images) return [];

    return project.images
      .filter(image => image.imageUrl)
      .sort((a, b) => a.sortOrder - b.sortOrder) // Sort by sortOrder
      .map(image => ({
        url: this.constructImageUrl(image.imageUrl),
        alt: image.description || project.name
      }));
  }

  /**
   * Get all videos for project
   */
  getProjectVideos(project: ProjectDto): { url: string; alt: string }[] {
    if (!project.videos) return [];

    return project.videos
      .filter(video => video.videoUrl)
      .map(video => ({
        url: this.constructVideoUrl(video.videoUrl),
        alt: video.description || project.name
      }));
  }

  /**
   * Check if project has any gallery content (images or videos)
   */
  hasGalleryContent(project: ProjectDto): boolean {
    return this.hasImages(project) || this.hasVideos(project);
  }

  /**
   * Check if project has images
   */
  hasImages(project: ProjectDto): boolean {
    return project.images ? project.images.length > 0 : false;
  }

  /**
   * Get all gallery items (images + videos) for the gallery
   */
  getGalleryItems(project: ProjectDto): { type: 'image' | 'video'; url: string; alt: string; sortOrder?: number }[] {
    const items: { type: 'image' | 'video'; url: string; alt: string; sortOrder?: number }[] = [];

    // Add images
    if (project.images && project.images.length > 0) {
      project.images
        .filter(image => image.imageUrl)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .forEach(image => {
          items.push({
            type: 'image',
            url: this.constructImageUrl(image.imageUrl),
            alt: image.description || project.name,
            sortOrder: image.sortOrder
          });
        });
    }

    // Add videos
    if (project.videos && project.videos.length > 0) {
      project.videos
        .filter(video => video.videoUrl)
        .forEach(video => {
          items.push({
            type: 'video',
            url: this.constructVideoUrl(video.videoUrl),
            alt: video.description || project.name
          });
        });
    }

    return items;
  }

  /**
   * Check if project has multiple gallery items (images + videos)
   */
  hasMultipleGalleryItems(project: ProjectDto): boolean {
    const imageCount = project.images ? project.images.length : 0;
    const videoCount = project.videos ? project.videos.length : 0;
    return (imageCount + videoCount) > 1;
  }

  /**
   * Get total gallery count (images + videos)
   */
  getTotalGalleryCount(project: ProjectDto): number {
    const imageCount = project.images ? project.images.length : 0;
    const videoCount = project.videos ? project.videos.length : 0;
    return imageCount + videoCount;
  }

  getProjectStatusLabel(status: ProjectStatus | number | string): string {
    // Handle different status input types
    let statusNum: number;

    if (typeof status === 'string') {
      // Convert string status to number
      const statusMap: { [key: string]: number } = {
        'Current': 0,
        'Future': 1,
        'Past': 2,
        'Available': 0,
        'Upcoming': 1,
        'Completed': 2
      };
      statusNum = statusMap[status] ?? parseInt(status, 10);
    } else {
      statusNum = Number(status);
    }

    // Return appropriate label
    switch (statusNum) {
      case 0:
      case ProjectStatus.Current:
        return this.translate.instant('projects.status.available');
      case 1:
      case ProjectStatus.Future:
        return this.translate.instant('projects.status.upcoming');
      case 2:
      case ProjectStatus.Past:
        return this.translate.instant('projects.status.completed');
      default:
        console.warn('Unknown project status:', status, 'converted to:', statusNum);
        return this.translate.instant('projects.status.available');
    }
  }

  getProjectStatusClass(status: ProjectStatus | number | string): string {
    // Handle different status input types
    let statusNum: number;

    if (typeof status === 'string') {
      const statusMap: { [key: string]: number } = {
        'Current': 0,
        'Future': 1,
        'Past': 2,
        'Available': 0,
        'Upcoming': 1,
        'Completed': 2
      };
      statusNum = statusMap[status] ?? parseInt(status, 10);
    } else {
      statusNum = Number(status);
    }

    switch (statusNum) {
      case 0:
      case ProjectStatus.Current:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 1:
      case ProjectStatus.Future:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 2:
      case ProjectStatus.Past:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-green-500/20 text-green-300 border-green-500/30'; // Default to available styling
    }
  }

  getProjectTechnologies(project: ProjectDto): string[] {
    // For real estate, this could represent construction technologies or amenities
    if (!project.technologiesUsed) return [];
    return project.technologiesUsed.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
  }

  /**
   * Get formatted project area
   */
  getFormattedArea(project: ProjectDto): string {
    if (!project.projectArea) return this.translate.instant('projects.notSpecified');
    return `${project.projectArea.toLocaleString()} ${this.translate.instant('projects.info.areaUnit')}`;
  }

  /**
   * Get formatted price range for real estate projects
   */
  getFormattedPriceRange(project: ProjectDto): string {
    if (project.priceRange) {
      return project.priceRange;
    }

    if (project.priceStart && project.priceEnd) {
      const currency = project.priceCurrency || 'EGP';
      const startPrice = this.formatPrice(project.priceStart, currency);
      const endPrice = this.formatPrice(project.priceEnd, currency);
      return `${startPrice} - ${endPrice}`;
    }

    if (project.priceStart) {
      const currency = project.priceCurrency || 'EGP';
      return `${this.translate.instant('projectDetails.price.startingFrom')} ${this.formatPrice(project.priceStart, currency)}`;
    }

    return this.translate.instant('projectDetails.price.contact');
  }

  /**
   * Get formatted total units
   */
  getFormattedUnits(project: ProjectDto): string {
    if (!project.totalUnits) return this.translate.instant('projects.notSpecified');
    return `${project.totalUnits.toLocaleString()} ${this.translate.instant('projects.info.units')}`;
  }

  /**
   * Get project translation for specific language
   */
  getProjectTranslation(project: ProjectDto, language: 'ar' | 'en'): any {
    if (!project.translations || project.translations.length === 0) {
      return {
        title: project.name,
        description: project.description,
        location: project.location,
        propertyType: project.propertyType
      };
    }

    const translation = project.translations.find(t => t.language === language);
    return translation || {
      title: project.name,
      description: project.description,
      location: project.location,
      propertyType: project.propertyType
    };
  }

  /**
   * Open Google Maps location
   */
  openGoogleMaps(url: string | undefined) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Open company project page
   */
  openCompanyUrl(url: string | undefined) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return this.translate.instant('common.notSpecified');

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return this.translate.instant('common.invalidDate');
    }
  }

  formatBudget(budget: number | undefined): string {
    if (!budget || budget === 0) return 'Not specified';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(budget);
  }

  /**
   * Format price with currency (for real estate)
   */
  formatPrice(price: number | undefined, currency: string = 'EGP'): string {
    if (!price || price === 0) return this.translate.instant('projectDetails.price.contact');

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    } catch {
      // Fallback if currency is not supported
      return `${price.toLocaleString()} ${currency}`;
    }
  }

  navigateToRelatedProject(projectId: string) {
    this.router.navigate(['/project', projectId]);
  }

  goBack() {
    this.router.navigate(['/projects']);
  }

  openProjectUrl(url: string | undefined) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  openGitHubUrl(url: string | undefined) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  updatePageMeta() {
    if (!this.project) return;
    this.seoService.updateProjectSEO(this.project);
  }

  /**
   * Get video thumbnail - for now returns fallback image, can be enhanced with actual thumbnail generation
   */
  getVideoThumbnail(video: any): string {
    if (video.thumbnailUrl) {
      return this.constructImageUrl(video.thumbnailUrl);
    }
    return '/public/no-image.svg';
  }

  retryLoadProject(): void {
    const id = this.currentProjectId || this.project?.id;
    if (id) {
      this.loadProject(id);
    }
  }
}
