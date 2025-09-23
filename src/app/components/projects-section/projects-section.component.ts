import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';
import { ProjectsService } from '../../services/projects.service';
import { ProjectDto, ProjectStatus } from '../../shared/types/api.types';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects-section.component.html',
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

  tabOptions = [
    { label: 'Previous Projects', value: 'previous' },
    { label: 'Current Projects', value: 'current' },
    { label: 'Future Projects', value: 'future' }
  ];

  constructor(private projectsService: ProjectsService, private router: Router, private notifications: NotificationService) {}

  ngOnInit() {
    this.loadProjects();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects() {
    this.loading = true;
    this.error = null;

    // Load only published projects for public access
    this.projectsService.getProjects(undefined, true)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading projects:', error);
          this.error = 'Failed to load projects. Please try again later.';
          return of([]);
        })
      )
      .subscribe(projects => {
        this.projects = projects;
        this.loading = false;

        // Initialize hover states for all projects
        this.projects.forEach(project => {
          this.cardHoverStates[project.id] = 'normal';
        });
      });
  }

  refreshProjects() {
    this.loadProjects();
  }

  getDisplayProjects(): ProjectDto[] {
    return this.isPage ? this.projects : this.projects.slice(0, 6);
  }

  get previousProjects(): ProjectDto[] {
    return this.projects.filter(p => p.status === ProjectStatus.Past);
  }

  get currentProjects(): ProjectDto[] {
    return this.projects.filter(p => p.status === ProjectStatus.Current);
  }

  get futureProjects(): ProjectDto[] {
    return this.projects.filter(p => p.status === ProjectStatus.Future);
  }

  getCurrentProjects(): ProjectDto[] {
    if (!this.isPage) {
      return this.getDisplayProjects();
    }

    switch (this.activeTab) {
      case 'previous':
        return this.previousProjects;
      case 'current':
        return this.currentProjects;
      case 'future':
        return this.futureProjects;
      default:
        return this.currentProjects;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onCardHover(projectId: string, hovered: boolean) {
    this.cardHoverStates[projectId] = hovered ? 'hovered' : 'normal';
  }

  trackByProjectId(index: number, project: ProjectDto): string {
    return project.id;
  }

  getProjectImageUrl(project: ProjectDto): string {
    // First, try to get the main image from the new images array
    if (project.mainImage && project.mainImage.imageData) {
      return `data:${project.mainImage.contentType};base64,${project.mainImage.imageData}`;
    }

    // If no main image, try to get the first image from the images array
    if (project.images && project.images.length > 0) {
      const firstImage = project.images[0];
      return `data:${firstImage.contentType};base64,${firstImage.imageData}`;
    }

    // Legacy support: If project has imageData, create a data URL
    if (project.imageData && project.imageContentType) {
      return `data:${project.imageContentType};base64,${project.imageData}`;
    }

    // Legacy support: If project has photoUrl, use it
    if (project.photoUrl) {
      return project.photoUrl;
    }

    // Return a placeholder image URL
    return 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=No+Image';
  }

  /**
   * Get all images for a project
   */
  getProjectImages(project: ProjectDto): { url: string; alt: string; isMain: boolean }[] {
    const images: { url: string; alt: string; isMain: boolean }[] = [];

    if (project.images && project.images.length > 0) {
      project.images.forEach(image => {
        images.push({
          url: `data:${image.contentType};base64,${image.imageData}`,
          alt: image.description || project.name,
          isMain: image.isMainImage
        });
      });
    } else if (project.imageData && project.imageContentType) {
      // Legacy support
      images.push({
        url: `data:${project.imageContentType};base64,${project.imageData}`,
        alt: project.name,
        isMain: true
      });
    }

    return images;
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
    if (project.images && project.images.length > 0) {
      return project.images.length;
    }
    if (project.imageData) {
      return 1;
    }
    return 0;
  }

  showToast() {
    this.notifications.toastInfo("Project details feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀");
  }

  viewProjectDetails(projectId: string) {
    this.router.navigate(['/project', projectId]);
  }

  getProjectStatusLabel(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Current:
        return 'Current';
      case ProjectStatus.Future:
        return 'Future';
      case ProjectStatus.Past:
        return 'Previous';
      default:
        return 'Unknown';
    }
  }

  hasProjectDetails(project: ProjectDto): boolean {
    return !!(project.technologiesUsed || project.projectUrl || project.gitHubUrl || project.client);
  }

  getProjectTechnologies(project: ProjectDto): string[] {
    if (!project.technologiesUsed) return [];
    return project.technologiesUsed.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
  }
}
