import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../core/services/api.service';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { environment } from '../../environments/environment';
import {
  ProjectDto,
  ApiProjectDto,
  CreateProjectRequestDto,
  UpdateProjectRequestDto,
  AddProjectImageRequestDto,
  AddProjectVideoRequestDto,
  ProjectImageDto,
  ProjectVideoDto,
  ProjectStatus,
  ApiResponse,
  ProjectFilterParams,
  PaginatedResponse,
  ProjectSummaryDto,
  ProjectTranslationDto
} from '../shared/types/api.types';
import { map, catchError } from 'rxjs/operators';

// Additional interfaces to match backend
export interface CreateProjectFormRequestDto {
  name: string;
  description: string;
  status: ProjectStatus;
  images?: File[];
  mainImageIndex?: number;
  videos?: File[];
  mainVideoIndex?: number;
  companyUrl?: string;
  googleMapsUrl?: string;
  location?: string;
  propertyType?: string;
  totalUnits?: number;
  projectArea?: number;
  priceStart?: number;
  priceEnd?: number;
  priceCurrency?: string;
  technologiesUsed?: string;
  projectUrl?: string;
  gitHubUrl?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  budget?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  translations?: ProjectTranslationCreateDto[];
}

export interface UpdateProjectFormRequestDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  newImages?: File[];
  removeImageIds?: string[];
  mainImageId?: string;
  newVideos?: File[];
  removeVideoIds?: string[];
  mainVideoId?: string;
  companyUrl?: string;
  googleMapsUrl?: string;
  location?: string;
  propertyType?: string;
  totalUnits?: number;
  projectArea?: number;
  priceStart?: number;
  priceEnd?: number;
  priceCurrency?: string;
  technologiesUsed?: string;
  projectUrl?: string;
  gitHubUrl?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  budget?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  translations?: ProjectTranslationCreateDto[];
}

export interface ProjectTranslationCreateDto {
  language: string;
  direction: 0 | 1; // 0 = LTR, 1 = RTL
  title: string;
  description: string;
}

export interface ProjectTranslationUpsertDto {
  language: string;
  direction: 0 | 1;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private readonly endpoint = '/projects';
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private errorHandling: ErrorHandlingService
  ) {
    // Ensure baseUrl is properly set
    if (!environment.apiBaseUrl) {
      console.error('API Base URL not configured in environment');
    }
  }

  /**
   * Get all projects with advanced filtering, pagination, and search
   */
  getProjects(filters?: ProjectFilterParams): Observable<PaginatedResponse<ProjectDto>> {
    const params: any = {};

    if (filters) {
      if (filters.status !== undefined) params.status = filters.status;
      if (filters.isPublished !== undefined) params.isPublished = filters.isPublished;
      if (filters.isFeatured !== undefined) params.isFeatured = filters.isFeatured;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.location) params.location = filters.location;
      if (filters.priceMin !== undefined) params.priceMin = filters.priceMin;
      if (filters.priceMax !== undefined) params.priceMax = filters.priceMax;
      if (filters.searchTerm) params.searchTerm = filters.searchTerm;
      if (filters.language) params.language = filters.language;
      if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
      if (filters.startDateTo) params.startDateTo = filters.startDateTo;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortDescending !== undefined) params.sortDescending = filters.sortDescending;
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.pageSize = filters.pageSize;
    }

    // Use getPublic for published projects to avoid authentication issues
    const usePublic = !filters || filters.isPublished === true;

    return (usePublic ?
      this.apiService.getPublic<ApiResponse<PaginatedResponse<ApiProjectDto>>>(this.endpoint, params) :
      this.apiService.get<ApiResponse<PaginatedResponse<ApiProjectDto>>>(this.endpoint, params)
    ).pipe(
      map((response: ApiResponse<PaginatedResponse<ApiProjectDto>>) => {
        console.log('🔍 Full API Response:', response);

        if (!response.ok || !response.data) {
          console.warn('⚠️ API response not ok or missing data');
          return {
            data: [],
            totalCount: 0,
            pageNumber: filters?.page || 1,
            pageSize: filters?.pageSize || 10,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false,
            nextPage: null,
            prevPage: null
          } as PaginatedResponse<ProjectDto>;
        }

        const paginatedData = response.data;
        return {
          ...paginatedData,
          data: paginatedData.data.map((apiProject: ApiProjectDto) => this.convertApiProjectToProject(apiProject))
        } as PaginatedResponse<ProjectDto>;
      }),
      catchError(error => {
        console.error('Error in getProjects:', error);
        return of({
          data: [],
          totalCount: 0,
          pageNumber: filters?.page || 1,
          pageSize: filters?.pageSize || 10,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
          nextPage: null,
          prevPage: null
        } as PaginatedResponse<ProjectDto>);
      })
    );
  }

  /**
   * Get projects summary (lightweight version for listing pages)
   */
  getProjectsSummary(filters?: ProjectFilterParams): Observable<PaginatedResponse<ProjectSummaryDto>> {
    const params: any = {};

    if (filters) {
      if (filters.status !== undefined) params.status = filters.status;
      if (filters.isPublished !== undefined) params.isPublished = filters.isPublished;
      if (filters.isFeatured !== undefined) params.isFeatured = filters.isFeatured;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.location) params.location = filters.location;
      if (filters.priceMin !== undefined) params.priceMin = filters.priceMin;
      if (filters.priceMax !== undefined) params.priceMax = filters.priceMax;
      if (filters.searchTerm) params.searchTerm = filters.searchTerm;
      if (filters.language) params.language = filters.language;
      if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
      if (filters.startDateTo) params.startDateTo = filters.startDateTo;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortDescending !== undefined) params.sortDescending = filters.sortDescending;
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.pageSize = filters.pageSize;
    }

    return this.apiService.getPublic<ApiResponse<PaginatedResponse<ProjectSummaryDto>>>(`${this.endpoint}/summary`, params).pipe(
      map((response: ApiResponse<PaginatedResponse<ProjectSummaryDto>>) => {
        console.log('🔍 Projects Summary API Response:', response);

        if (!response.ok || !response.data) {
          console.warn('⚠️ Summary API response not ok or missing data');
          return {
            data: [],
            totalCount: 0,
            pageNumber: filters?.page || 1,
            pageSize: filters?.pageSize || 10,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false,
            nextPage: null,
            prevPage: null
          } as PaginatedResponse<ProjectSummaryDto>;
        }

        return response.data;
      }),
      catchError(error => {
        console.error('Error in getProjectsSummary:', error);
        return of({
          data: [],
          totalCount: 0,
          pageNumber: filters?.page || 1,
          pageSize: filters?.pageSize || 10,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
          nextPage: null,
          prevPage: null
        } as PaginatedResponse<ProjectSummaryDto>);
      })
    );
  }

  /**
   * Get featured projects for homepage (returns summary DTOs for better performance)
   */
  getFeaturedProjects(count?: number, language?: 'ar' | 'en'): Observable<ProjectSummaryDto[]> {
    const params: any = {};
    if (count) params.count = count;
    if (language) params.language = language;

    return this.apiService.getPublic<ApiResponse<ProjectSummaryDto[]>>(`${this.endpoint}/featured`, params).pipe(
      map((response: ApiResponse<ProjectSummaryDto[]>) => {
        console.log('🔍 Featured Projects API Response:', response);

        if (!response.ok || !response.data) {
          console.warn('⚠️ Featured projects API response not ok or missing data');
          return [];
        }

        return response.data;
      }),
      catchError(error => {
        console.error('Error in getFeaturedProjects:', error);
        return of([]);
      })
    );
  }

  /**
   * Get single project by ID
   */
  getProject(id: string, language?: string): Observable<ProjectDto> {
    const params: any = {};
    if (language) params.language = language;

    return this.apiService.get<ApiResponse<ApiProjectDto>>(`${this.endpoint}/${id}`, params).pipe(
      map(response => {
        if (!response.ok || !response.data) {
          throw new Error(response.error?.message || 'Project not found');
        }
        return this.convertApiProjectToProject(response.data);
      })
    );
  }

  /**
   * Get single published project by ID (for public access)
   */
  getPublicProject(id: string, language?: string): Observable<ProjectDto | null> {
    const params: any = {};
    if (language) params.language = language;

    return this.apiService.getPublic<ApiResponse<ApiProjectDto>>(`${this.endpoint}/${id}`, params).pipe(
      map(response => {
        if (!response.ok || !response.data) {
          return null;
        }
        const project = this.convertApiProjectToProject(response.data);
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
   * Get projects by status (legacy method - uses paginated endpoint)
   */
  getProjectsByStatus(status: ProjectStatus): Observable<ProjectDto[]> {
    // Use the paginated endpoint and extract data
    return this.getProjectsByStatusPaginated(status, 1, 1000).pipe(
      map(paginatedResponse => {
        console.warn('getProjectsByStatus is deprecated, use getProjectsByStatusPaginated instead');
        return paginatedResponse.data.map(summary => ({
          ...summary,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: summary.mainImage ? [summary.mainImage] : [],
          videos: [],
          mainVideo: undefined
        })) as ProjectDto[];
      })
    );
  }

  /**
   * Get projects by status with pagination (matches API endpoint)
   */
  getProjectsByStatusPaginated(status: ProjectStatus, page: number = 1, pageSize: number = 12, language?: string): Observable<PaginatedResponse<ProjectSummaryDto>> {
    const params: any = { page, pageSize };
    if (language) params.language = language;

    return this.apiService.getPublic<ApiResponse<PaginatedResponse<ProjectSummaryDto>>>(`${this.endpoint}/by-status/${status}`, params).pipe(
      map((response: ApiResponse<PaginatedResponse<ProjectSummaryDto>>) => {
        if (!response.ok || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch projects');
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Error in getProjectsByStatusPaginated:', error);
        return of({
          data: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: 12,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
          nextPage: null,
          prevPage: null
        } as PaginatedResponse<ProjectSummaryDto>);
      })
    );
  }

  /**
   * Search projects with pagination (matches API endpoint)
   */
  searchProjectsPaginated(searchTerm: string, page: number = 1, pageSize: number = 12, language?: string, status?: ProjectStatus): Observable<PaginatedResponse<ProjectSummaryDto>> {
    const params: any = { searchTerm, page, pageSize };
    if (language) params.language = language;
    if (status !== undefined) params.status = status;

    return this.apiService.getPublic<ApiResponse<PaginatedResponse<ProjectSummaryDto>>>(`${this.endpoint}/search`, params).pipe(
      map((response: ApiResponse<PaginatedResponse<ProjectSummaryDto>>) => {
        if (!response.ok || !response.data) {
          throw new Error(response.error?.message || 'Failed to search projects');
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Error in searchProjectsPaginated:', error);
        return of({
          data: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: 12,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
          nextPage: null,
          prevPage: null
        } as PaginatedResponse<ProjectSummaryDto>);
      })
    );
  }

  /**
   * Get projects by property type with pagination
   */
  getProjectsByPropertyType(propertyType: string, page: number = 1, pageSize: number = 12, language?: string): Observable<PaginatedResponse<ProjectSummaryDto>> {
    const params: any = { page, pageSize };
    if (language) params.language = language;

    return this.apiService.getPublic<ApiResponse<PaginatedResponse<ProjectSummaryDto>>>(`${this.endpoint}/by-property-type/${propertyType}`, params).pipe(
      map((response: ApiResponse<PaginatedResponse<ProjectSummaryDto>>) => {
        if (!response.ok || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch projects by property type');
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Error in getProjectsByPropertyType:', error);
        return of({
          data: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: 12,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
          nextPage: null,
          prevPage: null
        } as PaginatedResponse<ProjectSummaryDto>);
      })
    );
  }

  /**
   * Get projects by location with pagination
   */
  getProjectsByLocation(location: string, page: number = 1, pageSize: number = 12, language?: string): Observable<PaginatedResponse<ProjectSummaryDto>> {
    const params: any = { page, pageSize };
    if (language) params.language = language;

    return this.apiService.getPublic<ApiResponse<PaginatedResponse<ProjectSummaryDto>>>(`${this.endpoint}/by-location/${location}`, params).pipe(
      map((response: ApiResponse<PaginatedResponse<ProjectSummaryDto>>) => {
        if (!response.ok || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch projects by location');
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Error in getProjectsByLocation:', error);
        return of({
          data: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: 12,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
          nextPage: null,
          prevPage: null
        } as PaginatedResponse<ProjectSummaryDto>);
      })
    );
  }

  // Image/Video URL and blob methods with correct backend endpoints
  /**
   * Get specific project image URL by image ID (matches backend endpoint)
   */
  getProjectImageUrlById(imageId: string): string {
    return `${this.baseUrl}/api/Projects/images/${imageId}`;
  }

  /**
   * Get optimized image URL with fallback handling
   */
  getOptimizedImageUrl(imageUrl: string, fallbackId?: string): string {
    // If imageUrl is already a full URL, return it
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/api'))) {
      return imageUrl;
    }

    // If no imageUrl but we have a fallbackId, construct URL
    if (!imageUrl && fallbackId) {
      return `${this.baseUrl}/api/Projects/images/${fallbackId}`;
    }

    // Return fallback image
    return '/assets/images/no-image.svg';
  }

  /**
   * Get specific project image as blob
   */
  getProjectImageById(imageId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/Projects/images/${imageId}`, {
      responseType: 'blob',
      headers: { 'Accept': 'image/*' }
    });
  }

  /**
   * Get specific project video by video ID
   */
  getProjectVideoById(videoId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/Projects/videos/${videoId}`, {
      responseType: 'blob',
      headers: { 'Accept': 'video/*' }
    });
  }

  /**
   * Get specific project video URL by video ID (matches backend endpoint)
   */
  getProjectVideoUrlById(videoId: string): string {
    return `${this.baseUrl}/api/Projects/videos/${videoId}`;
  }

  // Image/Video management methods
  /**
   * Add image to project (matches backend parameter expectations)
   */
  addProjectImage(projectId: string, imageData: { image: File; description?: string; isMainImage?: boolean }): Observable<ProjectImageDto> {
    const formData = new FormData();
    formData.append('image', imageData.image);

    if (imageData.description) {
      formData.append('description', imageData.description);
    }

    if (imageData.isMainImage !== undefined) {
      formData.append('isMainImage', imageData.isMainImage.toString());
    }

    return this.http.post<ApiResponse<ProjectImageDto>>(`${this.baseUrl}/api/Projects/${projectId}/images`, formData)
      .pipe(
        map(response => {
          if (!response.ok || !response.data) {
            throw new Error(response.error?.message || 'Failed to add image');
          }
          return response.data;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete specific project image
   */
  deleteProjectImage(imageId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/api/Projects/images/${imageId}`)
      .pipe(
        map(response => {
          if (!response.ok) {
            throw new Error(response.error?.message || 'Failed to delete image');
          }
          return response.data || true;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Set main image for a project
   */
  setProjectMainImage(projectId: string, imageId: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/api/Projects/${projectId}/images/${imageId}/set-main`, {})
      .pipe(
        map(response => {
          if (!response.ok) {
            throw new Error(response.error?.message || 'Failed to set main image');
          }
          return response.data || true;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Add video to project (matches backend parameter expectations)
   */
  addProjectVideo(projectId: string, videoData: { video: File; description?: string; isMainVideo?: boolean }): Observable<ProjectVideoDto> {
    const formData = new FormData();
    formData.append('video', videoData.video);

    if (videoData.description) {
      formData.append('description', videoData.description);
    }

    if (videoData.isMainVideo !== undefined) {
      formData.append('isMainVideo', videoData.isMainVideo.toString());
    }

    return this.http.post<ApiResponse<ProjectVideoDto>>(`${this.baseUrl}/api/Projects/${projectId}/videos`, formData)
      .pipe(
        map(response => {
          if (!response.ok || !response.data) {
            throw new Error(response.error?.message || 'Failed to add video');
          }
          return response.data;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete specific project video
   */
  deleteProjectVideo(videoId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/api/Projects/videos/${videoId}`)
      .pipe(
        map(response => {
          if (!response.ok) {
            throw new Error(response.error?.message || 'Failed to delete video');
          }
          return response.data || true;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Set main video for a project
   */
  setProjectMainVideo(projectId: string, videoId: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/api/Projects/${projectId}/videos/${videoId}/set-main`, {})
      .pipe(
        map(response => {
          if (!response.ok) {
            throw new Error(response.error?.message || 'Failed to set main video');
          }
          return response.data || true;
        }),
        catchError(error => this.handleError(error))
      );
  }

  // Project CRUD operations
  /**
   * Create new project with form data (matches backend FormData expectations)
   */
  createProjectWithFormData(projectData: CreateProjectFormRequestDto): Observable<ProjectDto> {
    const formData = new FormData();

    // Required fields
    formData.append('name', projectData.name);
    formData.append('description', projectData.description);
    formData.append('status', projectData.status.toString());

    // Handle images properly
    if (projectData.images && projectData.images.length > 0) {
      projectData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Handle main image index
    if (projectData.mainImageIndex !== undefined && projectData.mainImageIndex !== null) {
      formData.append('mainImageIndex', projectData.mainImageIndex.toString());
    }

    // Handle videos
    if (projectData.videos && projectData.videos.length > 0) {
      projectData.videos.forEach((video) => {
        formData.append('videos', video);
      });
    }

    // Handle main video index
    if (projectData.mainVideoIndex !== undefined && projectData.mainVideoIndex !== null) {
      formData.append('mainVideoIndex', projectData.mainVideoIndex.toString());
    }

    // Handle translations as JSON string
    if (projectData.translations && projectData.translations.length > 0) {
      formData.append('translations', JSON.stringify(projectData.translations));
    }

    // Add all other optional fields only if they have values
    Object.entries(projectData).forEach(([key, value]) => {
      if (value !== undefined && value !== null &&
          !['name', 'description', 'status', 'images', 'videos', 'translations', 'mainImageIndex', 'mainVideoIndex'].includes(key)) {
        formData.append(key, value.toString());
      }
    });

    return this.http.post<ApiResponse<ApiProjectDto>>(`${this.baseUrl}/api/Projects`, formData)
      .pipe(
        map(response => {
          if (!response.ok || !response.data) {
            throw new Error(response.error?.message || 'Failed to create project');
          }
          return this.convertApiProjectToProject(response.data);
        }),
        catchError(error => {
          console.error('Error creating project:', error);
          return throwError(() => new Error(error.error?.error?.message || error.message || 'Failed to create project'));
        })
      );
  }

  /**
   * Update existing project with form data
   */
  updateProjectWithFormData(id: string, projectData: UpdateProjectFormRequestDto): Observable<ProjectDto> {
    const formData = new FormData();

    // Add all fields only if they have values
    Object.entries(projectData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'newImages' && Array.isArray(value)) {
          value.forEach((image: File) => formData.append('newImages', image));
        } else if (key === 'newVideos' && Array.isArray(value)) {
          value.forEach((video: File) => formData.append('newVideos', video));
        } else if (key === 'removeImageIds' && Array.isArray(value)) {
          value.forEach((id: string) => formData.append('removeImageIds', id));
        } else if (key === 'removeVideoIds' && Array.isArray(value)) {
          value.forEach((id: string) => formData.append('removeVideoIds', id));
        } else if (key === 'translations' && Array.isArray(value)) {
          formData.append('translations', JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.http.put<ApiResponse<ApiProjectDto>>(`${this.baseUrl}/api/Projects/${id}`, formData)
      .pipe(
        map(response => {
          if (!response.ok || !response.data) {
            throw new Error(response.error?.message || 'Failed to update project');
          }
          return this.convertApiProjectToProject(response.data);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create new project (legacy method using JSON)
   */
  createProject(project: CreateProjectRequestDto): Observable<ProjectDto> {
    return this.apiService.post<ApiResponse<ApiProjectDto>>(this.endpoint, project).pipe(
      map(response => {
        if (!response.ok || !response.data) {
          throw new Error(response.error?.message || 'Failed to create project');
        }
        return this.convertApiProjectToProject(response.data);
      })
    );
  }

  /**
   * Update existing project (legacy method using JSON)
   */
  updateProject(id: string, updates: UpdateProjectRequestDto): Observable<ProjectDto> {
    return this.apiService.put<ApiResponse<ApiProjectDto>>(`${this.endpoint}/${id}`, updates).pipe(
      map(response => {
        if (!response.ok || !response.data) {
          throw new Error(response.error?.message || 'Failed to update project');
        }
        return this.convertApiProjectToProject(response.data);
      })
    );
  }

  /**
   * Delete project
   */
  deleteProject(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/api/Projects/${id}`)
      .pipe(
        map(response => {
          if (!response.ok) {
            throw new Error(response.error?.message || 'Failed to delete project');
          }
          return response.data || true;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Toggle project featured status
   */
  toggleProjectFeatured(id: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/api/Projects/${id}/toggle-featured`, {})
      .pipe(
        map(response => {
          if (!response.ok) {
            throw new Error(response.error?.message || 'Failed to toggle featured status');
          }
          return response.data || true;
        }),
        catchError(error => this.handleError(error))
      );
  }

  // Translation methods
  /**
   * Create or update project translation
   */
  createProjectTranslation(projectId: string, translation: ProjectTranslationUpsertDto): Observable<ProjectTranslationDto> {
    const requestData = {
      language: translation.language,
      direction: typeof translation.direction === 'string'
        ? (translation.direction === 'RTL' ? 1 : 0)
        : translation.direction,
      title: translation.title,
      description: translation.description
    };

    return this.http.post<ApiResponse<ProjectTranslationDto>>(`${this.baseUrl}/api/Projects/${projectId}/translations`, requestData)
      .pipe(
        map(response => {
          if (!response.ok || !response.data) {
            throw new Error(response.error?.message || 'Failed to create translation');
          }
          return response.data;
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete translation for a project
   */
  deleteProjectTranslation(projectId: string, language: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/api/Projects/${projectId}/translations/${language}`)
      .pipe(
        map(response => {
          if (!response.ok) {
            throw new Error(response.error?.message || 'Failed to delete translation');
          }
          return response.data || true;
        }),
        catchError(error => this.handleError(error))
      );
  }

  // Analytics method
  /**
   * Get project analytics/statistics
   */
  getProjectAnalyticsStats(): Observable<any> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/api/Projects/analytics/stats`)
      .pipe(
        map(response => {
          if (!response.ok || !response.data) {
            throw new Error(response.error?.message || 'Failed to get analytics');
          }
          // Parse JSON string response
          try {
            return JSON.parse(response.data);
          } catch (e) {
            console.warn('Analytics data is not JSON, returning as string');
            return response.data;
          }
        }),
        catchError(error => {
          console.error('Error getting analytics:', error);
          return throwError(() => new Error('Failed to get project analytics'));
        })
      );
  }

  // Utility methods
  /**
   * Check if a project has any images
   */
  hasImages(project: ProjectDto): boolean {
    return project.images && project.images.length > 0;
  }

  /**
   * Check if a project has any videos
   */
  hasVideos(project: ProjectDto): boolean {
    return project.videos && project.videos.length > 0;
  }

  /**
   * Get project display title based on language
   */
  getProjectTitle(project: ProjectDto, language?: string): string {
    if (language && project.translations) {
      const translation = project.translations.find(t => t.language === language);
      if (translation?.title) {
        return translation.title;
      }
    }
    return project.name;
  }

  /**
   * Get project display description based on language
   */
  getProjectDescription(project: ProjectDto, language?: string): string {
    if (language && project.translations) {
      const translation = project.translations.find(t => t.language === language);
      if (translation?.description) {
        return translation.description;
      }
    }
    return project.description;
  }

  /**
   * Format price range for display
   */
  formatPriceRange(project: ProjectDto): string {
    if (!project.priceStart && !project.priceEnd) {
      return 'Price not available';
    }

    const currency = project.priceCurrency || 'USD';
    const start = project.priceStart ? this.formatPrice(project.priceStart, currency) : '';
    const end = project.priceEnd ? this.formatPrice(project.priceEnd, currency) : '';

    if (start && end && start !== end) {
      return `${start} - ${end}`;
    }

    return start || end || 'Price not available';
  }

  private formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error?.error?.message) {
      errorMessage = error.error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
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
    if (!apiProject) {
      console.error('convertApiProjectToProject: apiProject is null or undefined');
      throw new Error('Invalid project data received from API');
    }

    try {
      const project: ProjectDto = {
        id: apiProject.id,
        createdAt: apiProject.createdAt,
        updatedAt: apiProject.updatedAt,
        name: apiProject.name,
        description: apiProject.description,
        status: this.convertStatusStringToEnum(apiProject.status),

        // Real estate fields
        companyUrl: apiProject.companyUrl,
        googleMapsUrl: apiProject.googleMapsUrl,
        location: apiProject.location,
        propertyType: apiProject.propertyType,
        totalUnits: apiProject.totalUnits,
        projectArea: apiProject.projectArea,
        priceStart: apiProject.priceStart,
        priceEnd: apiProject.priceEnd,
        priceCurrency: apiProject.priceCurrency,
        priceRange: apiProject.priceRange,

        // Legacy fields
        technologiesUsed: apiProject.technologiesUsed,
        projectUrl: apiProject.projectUrl,
        gitHubUrl: apiProject.gitHubUrl,
        startDate: apiProject.startDate,
        endDate: apiProject.endDate,
        client: apiProject.client,
        budget: apiProject.budget,

        // Publication fields
        isPublished: apiProject.isPublished,
        isFeatured: apiProject.isFeatured,
        sortOrder: apiProject.sortOrder,
        createdByName: apiProject.createdByName,

        // Navigation properties
        images: apiProject.images?.map(img => ({
          id: img.id,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
          imageUrl: this.getProjectImageUrlById(img.id),
          contentType: img.contentType,
          fileName: img.fileName,
          fileSize: img.fileSize,
          description: img.description,
          isMainImage: img.isMainImage,
          sortOrder: img.sortOrder,
          projectId: img.projectId,
          createdByName: img.createdByName
        })) || [],

        mainImage: apiProject.mainImage ? {
          id: apiProject.mainImage.id,
          createdAt: apiProject.mainImage.createdAt,
          updatedAt: apiProject.mainImage.updatedAt,
          imageUrl: this.getProjectImageUrlById(apiProject.mainImage.id),
          contentType: apiProject.mainImage.contentType,
          fileName: apiProject.mainImage.fileName,
          fileSize: apiProject.mainImage.fileSize,
          description: apiProject.mainImage.description,
          isMainImage: apiProject.mainImage.isMainImage,
          sortOrder: apiProject.mainImage.sortOrder,
          projectId: apiProject.mainImage.projectId,
          createdByName: apiProject.mainImage.createdByName
        } : undefined,

        videos: apiProject.videos?.map(vid => ({
          id: vid.id,
          createdAt: vid.createdAt,
          updatedAt: vid.updatedAt,
          videoUrl: this.getProjectVideoUrlById(vid.id),
          contentType: vid.contentType,
          fileName: vid.fileName,
          fileSize: vid.fileSize,
          description: vid.description,
          isMainVideo: vid.isMainVideo,
          sortOrder: vid.sortOrder,
          projectId: vid.projectId,
          createdByName: vid.createdByName
        })) || [],

        mainVideo: apiProject.mainVideo ? {
          id: apiProject.mainVideo.id,
          createdAt: apiProject.mainVideo.createdAt,
          updatedAt: apiProject.mainVideo.updatedAt,
          videoUrl: this.getProjectVideoUrlById(apiProject.mainVideo.id),
          contentType: apiProject.mainVideo.contentType,
          fileName: apiProject.mainVideo.fileName,
          fileSize: apiProject.mainVideo.fileSize,
          description: apiProject.mainVideo.description,
          isMainVideo: apiProject.mainVideo.isMainVideo,
          sortOrder: apiProject.mainVideo.sortOrder,
          projectId: apiProject.mainVideo.projectId,
          createdByName: apiProject.mainVideo.createdByName
        } : undefined,

        translations: apiProject.translations?.map(trans => ({
          language: trans.language,
          direction: typeof trans.direction === 'number'
            ? (trans.direction === 1 ? 'RTL' : 'LTR')
            : trans.direction,
          title: trans.title,
          description: trans.description
        })) || []
      };

      return project;
    } catch (error) {
      console.error('Error converting API project to project:', error);
      console.error('API Project data:', apiProject);
      throw new Error('Failed to convert project data');
    }
  }

  /**
   * Convert status string from API to ProjectStatus enum
   */
  private convertStatusStringToEnum(status: string | number): ProjectStatus {
    if (typeof status === 'number') {
      return status as ProjectStatus;
    }

    const statusStr = status.toString().toLowerCase();
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
