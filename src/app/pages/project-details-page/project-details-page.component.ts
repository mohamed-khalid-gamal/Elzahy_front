import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { ProjectsService } from '../../services/projects.service';
import { ProjectDto, ProjectStatus, ProjectImageDto } from '../../shared/types/api.types';
import { ImageGalleryComponent } from '../../shared/components/image-gallery/image-gallery.component';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-project-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageGalleryComponent],
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const projectId = params['id'];
      this.currentProjectId = projectId;
      if (projectId) {
        this.loadProject(projectId);
      } else {
        this.error = 'Project ID not found';
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
          this.error = 'Failed to load project details. Please try again later.';
          return of(null);
        })
      )
      .subscribe(project => {
        if (project) {
          this.project = project;
          this.updatePageMeta();
          this.loadRelatedProjects();
        } else {
          this.error = 'Project not found or not available for public viewing.';
          this.titleService.setTitle('Project Not Found');
        }
        this.loading = false;
      });
  }

  loadRelatedProjects() {
    if (!this.project) return;

    // Load other published projects with the same status
    this.projectsService.getProjects(this.project.status, true)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([]))
      )
      .subscribe(projects => {
        // Filter out current project and limit to 3 related projects
        this.relatedProjects = projects
          .filter(p => p.id !== this.project?.id)
          .slice(0, 3);
      });
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
    return 'https://via.placeholder.com/800x400/1a1a1a/ffffff?text=No+Image';
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

  getProjectStatusClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Current:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case ProjectStatus.Future:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case ProjectStatus.Past:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  }

  getProjectTechnologies(project: ProjectDto): string[] {
    if (!project.technologiesUsed) return [];
    return project.technologiesUsed.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not specified';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
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

    // Update page title
    this.titleService.setTitle(`${this.project.name} - Project Details`);

    // Update meta tags
    this.metaService.updateTag({
      name: 'description',
      content: this.project.description
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: this.project.name
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: this.project.description
    });

    if (this.project.imageData && this.project.imageContentType) {
      this.metaService.updateTag({
        property: 'og:image',
        content: `data:${this.project.imageContentType};base64,${this.project.imageData}`
      });
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.goBack();
    }
  }

  retryLoadProject() {
    if (this.currentProjectId) {
      this.loadProject(this.currentProjectId);
    }
  }
}
