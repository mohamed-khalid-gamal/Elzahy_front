import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';
import { ProjectsService } from '../../services/projects.service';
import { ProjectDto, ProjectStatus, ProjectFilterParams, PaginatedResponse } from '../../shared/types/api.types';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.css'],
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
          style({ opacity: 0, transform: 'translateY(50px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('cardHover', [
      state('normal', style({
        transform: 'translateY(0) scale(1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      })),
      state('hovered', style({
        transform: 'translateY(-8px) scale(1.03)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      })),
      transition('normal <=> hovered', animate('300ms ease-out'))
    ])
  ]
})
export class ProjectsSectionComponent implements OnInit, OnDestroy {
  @Input() isPage = false;

  private destroy$ = new Subject<void>();
  cardHoverStates: { [key: string]: string } = {};
  activeTab = 'current';
  projects: ProjectDto[] = [];
  loading = true;
  error: string | null = null;

  // Pagination properties
  currentPage = 1;
  pageSize = 12;
  totalCount = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;

  tabOptions = [
    { label: 'projects.tabs.completed', value: 'previous' },
    { label: 'projects.tabs.available', value: 'current' },
    { label: 'projects.tabs.upcoming', value: 'future' }
  ];

  constructor(
    private projectsService: ProjectsService,
    private router: Router,
    private notifications: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects() {
    if (this.isPage) {
      // For the projects page, use status-based loading
      this.loadProjectsWithStatus();
      return;
    }

    // For homepage, load featured/recent projects
    this.loading = true;
    this.error = null;

    const filters: ProjectFilterParams = {
      isPublished: true,
      page: 1,
      pageSize: 6 // Show 6 on homepage
    };

    this.projectsService.getProjects(filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading projects:', error);
          this.error = this.translate.instant('projects.error');
          return of({ data: [], totalCount: 0, pageNumber: 1, pageSize: 12, totalPages: 0, hasPrevious: false, hasNext: false });
        })
      )
      .subscribe(response => {
        console.log('📦 Projects component received response:', response);

        // The response IS the PaginatedResponse, not wrapped in another object
        if (response && Array.isArray(response.data)) {
          this.projects = response.data;
          this.totalCount = response.totalCount || 0;
          this.currentPage = response.pageNumber || 1;
          this.totalPages = response.totalPages || 0;
          this.hasNext = response.hasNext || false;
          this.hasPrevious = response.hasPrevious || false;

          console.log('✅ Successfully loaded', this.projects.length, 'projects');
          console.log('📄 Pagination info:', {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalCount: this.totalCount,
            hasNext: this.hasNext,
            hasPrevious: this.hasPrevious
          });

          // Initialize hover states for all projects
          this.projects.forEach(project => {
            this.cardHoverStates[project.id] = 'normal';
          });
        } else if (response && Array.isArray(response)) {
          // Fallback: if response is directly an array (not paginated)
          this.projects = response;
          this.totalCount = response.length;
          this.currentPage = 1;
          this.totalPages = 1;
          this.hasNext = false;
          this.hasPrevious = false;

          console.log('✅ Successfully loaded', this.projects.length, 'projects (non-paginated)');

          // Initialize hover states for all projects
          this.projects.forEach(project => {
            this.cardHoverStates[project.id] = 'normal';
          });
        } else {
          console.error('❌ Invalid response format received:', response);
          this.projects = [];
          this.totalCount = 0;
          this.currentPage = 1;
          this.totalPages = 0;
          this.hasNext = false;
          this.hasPrevious = false;
          this.error = this.translate.instant('projects.invalidData');
        }

        this.loading = false;
      });
  }

  refreshProjects() {
    this.loadProjects();
  }

  // Debug method to check component state
  debugPaginationState() {
    console.log('🔍 Pagination Debug State:', {
      isPage: this.isPage,
      activeTab: this.activeTab,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalCount: this.totalCount,
      totalPages: this.totalPages,
      hasNext: this.hasNext,
      hasPrevious: this.hasPrevious,
      projectsCount: this.projects?.length || 0,
      loading: this.loading,
      error: this.error
    });
  }

  getDisplayProjects(): ProjectDto[] {
    // Ensure projects is always an array
    const safeProjects = Array.isArray(this.projects) ? this.projects : [];
    return this.isPage ? safeProjects : safeProjects.slice(0, 6);
  }

  get previousProjects(): ProjectDto[] {
    // Ensure projects is always an array
    const safeProjects = Array.isArray(this.projects) ? this.projects : [];
    return safeProjects.filter(p => p.status === ProjectStatus.Past);
  }

  get currentProjects(): ProjectDto[] {
    // Ensure projects is always an array
    const safeProjects = Array.isArray(this.projects) ? this.projects : [];
    return safeProjects.filter(p => p.status === ProjectStatus.Current);
  }

  get futureProjects(): ProjectDto[] {
    // Ensure projects is always an array
    const safeProjects = Array.isArray(this.projects) ? this.projects : [];
    return safeProjects.filter(p => p.status === ProjectStatus.Future);
  }

  /**
   * Load projects based on active status tab (for projects page)
   */
  loadProjectsWithStatus() {
    if (!this.isPage) return;

    this.loading = true;
    this.error = null;

    let statusFilter: number;
    switch (this.activeTab) {
      case 'current':
        statusFilter = 0; // Current/Available
        break;
      case 'future':
        statusFilter = 1; // Future/Upcoming
        break;
      case 'previous':
        statusFilter = 2; // Past/Completed
        break;
      default:
        statusFilter = 0;
    }

    const filters: ProjectFilterParams = {
      status: statusFilter,
      isPublished: true,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.projectsService.getProjects(filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading projects by status:', error);
          this.error = this.translate.instant('projects.error');
          return of({ data: [], totalCount: 0, pageNumber: 1, pageSize: 12, totalPages: 0, hasPrevious: false, hasNext: false });
        })
      )
      .subscribe(response => {
        if (response && Array.isArray(response.data)) {
          this.projects = response.data;
          this.totalCount = response.totalCount || 0;
          this.currentPage = response.pageNumber || 1;
          this.totalPages = response.totalPages || 0;
          this.hasNext = response.hasNext || false;
          this.hasPrevious = response.hasPrevious || false;

          // Initialize hover states for all projects
          this.projects.forEach(project => {
            this.cardHoverStates[project.id] = 'normal';
          });
        } else {
          this.projects = [];
          this.totalCount = 0;
          this.error = this.translate.instant('projects.invalidData');
        }

        this.loading = false;
      });
  }

  /**
   * Set active tab and reload projects
   */
  setActiveTab(tab: string) {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.currentPage = 1; // Reset to first page when changing tabs
      this.loadProjectsWithStatus();
    }
  }

  /**
   * Handle card hover state
   */
  onCardHover(projectId: string, isHovered: boolean) {
    this.cardHoverStates[projectId] = isHovered ? 'hovered' : 'normal';
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByProjectId(index: number, project: ProjectDto): string {
    return project.id;
  }

  /**
   * Get current projects based on active tab and pagination
   */
  getCurrentProjects(): ProjectDto[] {
    if (this.isPage) {
      // For project page, return all projects (already filtered by status)
      return this.projects;
    } else {
      // For homepage, return limited projects
      return this.getDisplayProjects();
    }
  }

  /**
   * Navigate to project details page
   */
  viewProjectDetails(projectId: string) {
    this.router.navigate(['/project', projectId]);
  }

  /**
   * Handle image loading errors
   */
  handleImageError(event: any, project?: ProjectDto) {
    console.error('❌ Image failed to load:', {
      src: event.target.src,
      project: project?.name,
      originalError: event
    });

    // Try fallback image
    if (event.target.src !== '/public/no-image.svg') {
      event.target.src = '/public/no-image.svg';
    }
  }

  /**
   * Handle successful image loading
   */
  handleImageLoad(event: any) {
    console.log('✅ Image loaded successfully:', {
      src: event.target.src,
      naturalWidth: event.target.naturalWidth,
      naturalHeight: event.target.naturalHeight
    });
  }

  /**
   * Get image count for a project
   */
  getImageCount(project: ProjectDto): number {
    return project.images ? project.images.length : 0;
  }

  /**
   * Get video count for a project
   */
  getVideoCount(project: ProjectDto): number {
    return project.videos ? project.videos.length : 0;
  }

  /**
   * Get project status label (translated)
   */
  getProjectStatusLabel(status: any): string {
    switch (Number(status)) {
      case 0: return this.translate.instant('projects.status.available');
      case 1: return this.translate.instant('projects.status.upcoming');
      case 2: return this.translate.instant('projects.status.completed');
      default: return this.translate.instant('projects.status.available');
    }
  }

  /**
   * Get formatted project area
   */
  getFormattedArea(project: ProjectDto): string {
    if (!project.projectArea) return this.translate.instant('projects.notSpecified');
    return `${project.projectArea.toLocaleString()} ${this.translate.instant('projects.info.areaUnit')}`;
  }

  /**
   * Check if project is featured
   */
  isFeaturedProject(project: ProjectDto): boolean {
    return project.isFeatured || false;
  }

  /**
   * Pagination: Go to previous page
   */
  previousPage() {
    if (this.hasPrevious) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Pagination: Go to next page
   */
  nextPage() {
    if (this.hasNext) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Pagination: Go to specific page
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      if (this.isPage) {
        this.loadProjectsWithStatus();
      } else {
        this.loadProjects();
      }
    }
  }

  /**
   * Get array of page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Get end index for pagination display
   */
  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  /**
   * Get project image URL with video fallback
   */
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
   * Get proper image URL using the same logic as project details
   */
  getImageUrl(image: any): string {
    if (!image) return '/public/no-image.svg';

    // Prefer explicit imageUrl if present
    if (image.imageUrl) {
      // Absolute URL
      if (image.imageUrl.startsWith('http://') || image.imageUrl.startsWith('https://')) {
        return image.imageUrl;
      }
      // Use shared constructor that handles prod/dev base URL
      return this.constructImageUrl(image.imageUrl);
    }

    // Fallback to API by id
    if (image.id) {
      return this.projectsService.getImageUrl(image.id);
    }

    return '/public/no-image.svg';
  }

  /**
   * Construct proper image URL from backend response
   */
  constructImageUrl(imageUrl: string): string {
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
   * Get proper video URL using the projects service
   */
  getVideoUrl(video: any): string {
    return this.projectsService.getVideoUrlFromProjectVideo(video);
  }

  /**
   * Construct proper video URL from backend response
   */
  constructVideoUrl(videoUrl: string): string {
    return this.projectsService.constructVideoUrl(videoUrl);
  }

  /**
   * Check if project has multiple images
   */
  hasMultipleImages(project: ProjectDto): boolean {
    return project.images ? project.images.length > 1 : false;
  }

  /**
   * Check if project has images
   */
  hasImages(project: ProjectDto): boolean {
    return project.images ? project.images.length > 0 : false;
  }

  /**
   * Check if project has videos
   */
  hasVideos(project: ProjectDto): boolean {
    return project.videos ? project.videos.length > 0 : false;
  }

  /**
   * Get video thumbnail - for now returns fallback image, can be enhanced with actual thumbnail generation
   */
  getVideoThumbnail(video: any): string {
    // In the future, this could generate/return actual video thumbnails
    // For now, we could try to use the video URL with a poster attribute or return fallback
    if (video.thumbnailUrl) {
      return this.constructImageUrl(video.thumbnailUrl);
    }
    return '/public/no-image.svg';
  }

  /**
   * Check if a media item is an image based on file extension or MIME type
   */
  isImageFile(media: any): boolean {
    if (media.imageUrl) {
      const url = media.imageUrl.toLowerCase();
      return url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') ||
             url.includes('.gif') || url.includes('.webp') || url.includes('.bmp') ||
             url.includes('.svg');
    }
    return true; // Default to image if we can't determine
  }

  /**
   * Check if a media item is a video based on file extension
   */
  isVideoFile(media: any): boolean {
    if (media.imageUrl) {
      const url = media.imageUrl.toLowerCase();
      return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') ||
             url.includes('.avi') || url.includes('.mov') || url.includes('.wmv') ||
             url.includes('.flv') || url.includes('.mkv');
    }
    return false;
  }
}
