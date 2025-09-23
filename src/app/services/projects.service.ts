import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../core/services/api.service';
import { environment } from '../../environments/environment';
import {
  ProjectDto,
  ApiProjectDto,
  CreateProjectRequestDto,
  UpdateProjectRequestDto,
  CreateProjectFormRequestDto,
  UpdateProjectFormRequestDto,
  AddProjectImageRequestDto,
  ProjectImageDto,
  ProjectStatus,
  ApiResponse
} from '../shared/types/api.types';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private readonly endpoint = '/projects';
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Get all projects with optional filters
   */
  getProjects(status?: ProjectStatus, isPublished?: boolean): Observable<ProjectDto[]> {
    const params: any = {};
    if (status !== undefined) params.status = status;
    if (isPublished !== undefined) params.isPublished = isPublished;

    // Use getPublic for published projects to avoid authentication issues
    if (isPublished === true) {
      return this.apiService.getPublic<ApiProjectDto[]>(this.endpoint, params).pipe(
        map(apiProjects => apiProjects.map(apiProject => this.convertApiProjectToProject(apiProject)))
      );
    }

    return this.apiService.get<ApiProjectDto[]>(this.endpoint, params).pipe(
      map(apiProjects => apiProjects.map(apiProject => this.convertApiProjectToProject(apiProject)))
    );
  }

  /**
   * Get single project by ID
   */
  getProject(id: string): Observable<ProjectDto> {
    return this.apiService.get<ApiProjectDto>(`${this.endpoint}/${id}`).pipe(
      map(apiProject => this.convertApiProjectToProject(apiProject))
    );
  }

  /**
   * Get single published project by ID (for public access)
   */
  getPublicProject(id: string): Observable<ProjectDto | null> {
    return this.apiService.getPublic<ApiProjectDto>(`${this.endpoint}/${id}`).pipe(
      map(apiProject => {
        const project = this.convertApiProjectToProject(apiProject);
        // Only return the project if it's published
        return project.isPublished ? project : null;
      }),
      catchError(error => {
        console.error('Error fetching public project:', error);
        return of(null);
      })
    );
  }

  /**
   * Get projects by status
   */
  getProjectsByStatus(status: ProjectStatus): Observable<ProjectDto[]> {
    return this.apiService.get<ApiProjectDto[]>(`${this.endpoint}/status/${status}`).pipe(
      map(apiProjects => apiProjects.map(apiProject => this.convertApiProjectToProject(apiProject)))
    );
  }

  /**
   * Create new project with form data (supports multiple file uploads)
   */
  createProjectWithFormData(projectData: CreateProjectFormRequestDto): Observable<ProjectDto> {
    const formData = new FormData();

    // Add required fields
    formData.append('name', projectData.name);
    formData.append('description', projectData.description);
    formData.append('status', projectData.status.toString());

    // Add multiple images if they exist
    if (projectData.images && projectData.images.length > 0) {
      projectData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    // Add main image index if specified
    if (projectData.mainImageIndex !== undefined && projectData.mainImageIndex !== null) {
      formData.append('mainImageIndex', projectData.mainImageIndex.toString());
    }

    // Add optional fields if they exist
    if (projectData.technologiesUsed) {
      formData.append('technologiesUsed', projectData.technologiesUsed);
    }
    if (projectData.projectUrl) {
      formData.append('projectUrl', projectData.projectUrl);
    }
    if (projectData.gitHubUrl) {
      formData.append('gitHubUrl', projectData.gitHubUrl);
    }
    if (projectData.startDate) {
      formData.append('startDate', projectData.startDate);
    }
    if (projectData.endDate) {
      formData.append('endDate', projectData.endDate);
    }
    if (projectData.client) {
      formData.append('client', projectData.client);
    }
    if (projectData.budget !== undefined && projectData.budget !== null) {
      formData.append('budget', projectData.budget.toString());
    }
    if (projectData.isPublished !== undefined) {
      formData.append('isPublished', projectData.isPublished.toString());
    }
    if (projectData.sortOrder !== undefined) {
      formData.append('sortOrder', projectData.sortOrder.toString());
    }

    return this.http.post<ApiResponse<ApiProjectDto>>(`${this.baseUrl}${this.endpoint}`, formData)
      .pipe(
        map(response => this.convertApiProjectToProject(this.handleApiResponse(response))),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update existing project with form data (supports multiple file uploads and image management)
   */
  updateProjectWithFormData(id: string, projectData: UpdateProjectFormRequestDto): Observable<ProjectDto> {
    const formData = new FormData();

    // Add fields if they exist
    if (projectData.name) {
      formData.append('name', projectData.name);
    }
    if (projectData.description) {
      formData.append('description', projectData.description);
    }
    if (projectData.status !== undefined) {
      formData.append('status', projectData.status.toString());
    }

    // Add new images if they exist
    if (projectData.newImages && projectData.newImages.length > 0) {
      projectData.newImages.forEach((image) => {
        formData.append('newImages', image);
      });
    }

    // Add image IDs to remove if they exist
    if (projectData.removeImageIds && projectData.removeImageIds.length > 0) {
      projectData.removeImageIds.forEach((imageId) => {
        formData.append('removeImageIds', imageId);
      });
    }

    // Set main image if specified
    if (projectData.mainImageId) {
      formData.append('mainImageId', projectData.mainImageId);
    }
    if (projectData.technologiesUsed) {
      formData.append('technologiesUsed', projectData.technologiesUsed);
    }
    if (projectData.projectUrl) {
      formData.append('projectUrl', projectData.projectUrl);
    }
    if (projectData.gitHubUrl) {
      formData.append('gitHubUrl', projectData.gitHubUrl);
    }
    if (projectData.startDate) {
      formData.append('startDate', projectData.startDate);
    }
    if (projectData.endDate) {
      formData.append('endDate', projectData.endDate);
    }
    if (projectData.client) {
      formData.append('client', projectData.client);
    }
    if (projectData.budget !== undefined && projectData.budget !== null) {
      formData.append('budget', projectData.budget.toString());
    }
    if (projectData.isPublished !== undefined) {
      formData.append('isPublished', projectData.isPublished.toString());
    }
    if (projectData.sortOrder !== undefined) {
      formData.append('sortOrder', projectData.sortOrder.toString());
    }

    return this.http.put<ApiResponse<ApiProjectDto>>(`${this.baseUrl}${this.endpoint}/${id}`, formData)
      .pipe(
        map(response => this.convertApiProjectToProject(this.handleApiResponse(response))),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get project image as blob
   */
  getProjectImage(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.endpoint}/${id}/image`, { responseType: 'blob' });
  }

  /**
   * Get specific project image by image ID
   */
  getProjectImageById(imageId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.endpoint}/images/${imageId}`, { responseType: 'blob' });
  }

  /**
   * Get project image URL for direct use in img src (legacy method)
   */
  getProjectImageUrl(id: string): string {
    return `${this.baseUrl}${this.endpoint}/${id}/image`;
  }

  /**
   * Get specific project image URL by image ID
   */
  getProjectImageUrlById(imageId: string): string {
    return `${this.baseUrl}${this.endpoint}/images/${imageId}`;
  }

  /**
   * Add single image to existing project
   */
  addProjectImage(projectId: string, imageData: AddProjectImageRequestDto): Observable<ProjectImageDto> {
    const formData = new FormData();
    formData.append('image', imageData.image);

    if (imageData.description) {
      formData.append('description', imageData.description);
    }

    if (imageData.isMainImage !== undefined) {
      formData.append('isMainImage', imageData.isMainImage.toString());
    }

    return this.http.post<ApiResponse<ProjectImageDto>>(`${this.baseUrl}${this.endpoint}/${projectId}/images`, formData)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete specific project image
   */
  deleteProjectImage(imageId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}${this.endpoint}/images/${imageId}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Set main image for a project
   */
  setProjectMainImage(projectId: string, imageId: string): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}${this.endpoint}/${projectId}/images/${imageId}/set-main`, {})
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create new project (legacy method using JSON)
   */
  createProject(project: CreateProjectRequestDto): Observable<ProjectDto> {
    return this.apiService.post<ApiProjectDto>(this.endpoint, project).pipe(
      map(apiProject => this.convertApiProjectToProject(apiProject))
    );
  }

  /**
   * Update existing project (legacy method using JSON)
   */
  updateProject(id: string, updates: UpdateProjectRequestDto): Observable<ProjectDto> {
    return this.apiService.put<ApiProjectDto>(`${this.endpoint}/${id}`, updates).pipe(
      map(apiProject => this.convertApiProjectToProject(apiProject))
    );
  }

  /**
   * Delete project
   */
  deleteProject(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Search projects by name or description
   */
  searchProjects(query: string): Observable<ProjectDto[]> {
    return this.apiService.get<ApiProjectDto[]>(`${this.endpoint}/search`, { q: query }).pipe(
      map(apiProjects => apiProjects.map(apiProject => this.convertApiProjectToProject(apiProject)))
    );
  }

  /**
   * Handle successful API response
   */
  private handleApiResponse<T>(response: ApiResponse<T>): T {
    if (response.ok && response.data !== undefined) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Request failed');
  }

  /**
   * Handle API errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error && error.error.error && error.error.error.message) {
      errorMessage = error.error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Convert API response project to internal project format
   */
  private convertApiProjectToProject(apiProject: ApiProjectDto): ProjectDto {
    return {
      ...apiProject,
      status: this.convertStatusStringToEnum(apiProject.status)
    };
  }

  /**
   * Convert status string from API to ProjectStatus enum
   */
  private convertStatusStringToEnum(status: string): ProjectStatus {
    const statusStr = status.toLowerCase();
    switch (statusStr) {
      case 'current':
      case '0':
        return ProjectStatus.Current;
      case 'future':
      case '1':
        return ProjectStatus.Future;
      case 'past':
      case 'previous':
      case '2':
        return ProjectStatus.Past;
      default:
        // Try to parse as number
        const numStatus = parseInt(status.toString(), 10);
        if (!isNaN(numStatus) && numStatus >= 0 && numStatus <= 2) {
          return numStatus as ProjectStatus;
        }
        return ProjectStatus.Current; // Default fallback
    }
  }
}
