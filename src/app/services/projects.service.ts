import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ProjectDto,
  ProjectSummaryDto,
  ProjectStatus,
  CreateProjectFormRequestDto,
  UpdateProjectFormRequestDto,
  ProjectTranslationUpsertDto,
  ProjectFilterParams,
  ApiResponse,
  PaginatedResponse
} from '../shared/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/Projects`;

  constructor(private http: HttpClient) {}

  // Get paginated projects with filtering and sorting
  getProjects(
    filtersOrPage?: ProjectFilterParams | number,
    pageSize?: number,
    status?: ProjectStatus,
    searchTerm?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Observable<PaginatedResponse<ProjectDto>> {
    let params = new HttpParams();

    // Handle both old-style parameters and new filter object
    if (typeof filtersOrPage === 'object' && filtersOrPage !== null) {
      // New style: using ProjectFilterParams
      const filters = filtersOrPage;

      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      else params = params.set('page', '1');

      if (filters.pageSize !== undefined) params = params.set('pageSize', filters.pageSize.toString());
      else params = params.set('pageSize', '10');

      if (filters.status !== undefined && filters.status !== null) {
        params = params.set('status', this.convertStatusToNumber(filters.status).toString());
      }
      if (filters.isPublished !== undefined) {
        params = params.set('isPublished', filters.isPublished.toString());
      }
      if (filters.isFeatured !== undefined) {
        params = params.set('isFeatured', filters.isFeatured.toString());
      }
      if (filters.propertyType) {
        params = params.set('propertyType', filters.propertyType);
      }
      if (filters.location) {
        params = params.set('location', filters.location);
      }
      if (filters.priceMin !== undefined) {
        params = params.set('priceMin', filters.priceMin.toString());
      }
      if (filters.priceMax !== undefined) {
        params = params.set('priceMax', filters.priceMax.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.language) {
        params = params.set('language', filters.language);
      }
      if (filters.startDateFrom) {
        params = params.set('startDateFrom', filters.startDateFrom);
      }
      if (filters.startDateTo) {
        params = params.set('startDateTo', filters.startDateTo);
      }
      if (filters.sortBy) {
        params = params.set('sortBy', filters.sortBy);
      }
      if (filters.sortDescending !== undefined) {
        params = params.set('sortDescending', filters.sortDescending.toString());
      }
    } else {
      // Old style: individual parameters (for backward compatibility)
      const page = typeof filtersOrPage === 'number' ? filtersOrPage : 1;
      params = params
        .set('page', page.toString())
        .set('pageSize', (pageSize || 10).toString());

      if (status !== undefined && status !== null) {
        params = params.set('status', this.convertStatusToNumber(status).toString());
      }
      if (searchTerm) {
        params = params.set('searchTerm', searchTerm);
      }
      if (sortBy) {
        params = params.set('sortBy', sortBy);
      }
      if (sortOrder) {
        params = params.set('sortOrder', sortOrder);
      }
    }

    return this.http.get<ApiResponse<PaginatedResponse<ProjectDto>>>(`${this.baseUrl}`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get projects summary for admin dashboard
  getProjectsSummary(filters: any = {}): Observable<ProjectSummaryDto[]> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params = params.append(key, filters[key].toString());
      }
    });

    return this.http.get<ApiResponse<ProjectSummaryDto[]>>(`${this.baseUrl}/summary`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get featured projects for public display
  getFeaturedProjects(count: number = 6, language?: string): Observable<ProjectDto[]> {
    let params = new HttpParams()
      .set('count', count.toString());

    if (language) {
      params = params.set('language', language);
    }

    return this.http.get<ApiResponse<ProjectDto[]>>(`${this.baseUrl}/featured`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get single project by ID (admin access)
  getProject(id: string | number, language?: string): Observable<ProjectDto> {
    // Don't convert to number - keep as string since API might expect GUID strings
    const projectId = id.toString();
    let params = new HttpParams();
    if (language) {
      params = params.set('language', language);
    }

    return this.http.get<ApiResponse<ProjectDto>>(`${this.baseUrl}/${projectId}`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get single project by ID (public access)
  getPublicProject(id: string | number, language?: string): Observable<ProjectDto> {
    // Don't convert to number - keep as string since API might expect GUID strings
    const projectId = id.toString();
    let params = new HttpParams();
    if (language) {
      params = params.set('language', language);
    }
    return this.http.get<ApiResponse<ProjectDto>>(`${this.baseUrl}/${projectId}`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get projects by status
  getProjectsByStatus(status: ProjectStatus): Observable<ProjectDto[]> {
    const statusNumber = this.convertStatusToNumber(status);
    return this.http.get<ApiResponse<ProjectDto[]>>(`${this.baseUrl}/status/${statusNumber}`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Create new project
  createProject(projectData: CreateProjectFormRequestDto): Observable<ProjectDto> {
    const formData = this.buildProjectFormData(projectData);
    return this.http.post<ApiResponse<ProjectDto>>(`${this.baseUrl}`, formData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Update existing project
  updateProject(id: string | number, projectData: UpdateProjectFormRequestDto): Observable<ProjectDto> {
    const projectId = id.toString();
    const formData = this.buildProjectFormData(projectData, true);
    return this.http.put<ApiResponse<ProjectDto>>(`${this.baseUrl}/${projectId}`, formData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Delete project
  deleteProject(id: string | number): Observable<void> {
    const projectId = id.toString();
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${projectId}`)
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  // Update project status
  updateProjectStatus(id: string | number, status: ProjectStatus): Observable<ProjectDto> {
    const projectId = id.toString();
    const statusNumber = this.convertStatusToNumber(status);
    return this.http.patch<ApiResponse<ProjectDto>>(`${this.baseUrl}/${projectId}/status`, { status: statusNumber })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Add translation to project
  addProjectTranslation(projectId: string | number, translation: ProjectTranslationUpsertDto): Observable<ProjectDto> {
    const id = projectId.toString();
    const direction = typeof translation.direction === 'string'
      ? this.convertDirectionToNumber(translation.direction)
      : translation.direction;

    const translationDto = {
      ...translation,
      direction
    };

    return this.http.post<ApiResponse<ProjectDto>>(`${this.baseUrl}/${id}/translations`, translationDto)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Update project translation
  updateProjectTranslation(projectId: string | number, direction: string | number, translation: ProjectTranslationUpsertDto): Observable<ProjectDto> {
    const id = projectId.toString();
    const directionNumber = typeof direction === 'string'
      ? this.convertDirectionToNumber(direction)
      : direction;

    const translationDto = {
      ...translation,
      direction: directionNumber
    };

    return this.http.put<ApiResponse<ProjectDto>>(`${this.baseUrl}/${id}/translations/${directionNumber}`, translationDto)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Delete project translation
  deleteProjectTranslation(projectId: string | number, direction: string | number): Observable<ProjectDto> {
    const id = projectId.toString();
    const directionNumber = typeof direction === 'string'
      ? this.convertDirectionToNumber(direction)
      : direction;

    return this.http.delete<ApiResponse<ProjectDto>>(`${this.baseUrl}/${id}/translations/${directionNumber}`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Image and video management methods
  getImageUrl(imageId: string | number): string {
    const id = imageId.toString();
    // Use lowercase 'projects' to match API endpoints
    const baseApiUrl = environment.apiBaseUrl;

    // Construct the proper image URL based on environment
    if (baseApiUrl.startsWith('http://') || baseApiUrl.startsWith('https://')) {
      // Production: return absolute URL
      const origin = new URL(baseApiUrl).origin;
      return `${origin}/api/projects/images/${id}`;
    } else {
      // Development: return relative URL for proxy
      return `/api/projects/images/${id}`;
    }
  }

  getVideoUrl(videoId: string | number): string {
    const id = videoId.toString();
    const baseApiUrl = environment.apiBaseUrl;

    // Construct the proper video URL based on environment
    if (baseApiUrl.startsWith('http://') || baseApiUrl.startsWith('https://')) {
      // Production: return absolute URL
      const origin = new URL(baseApiUrl).origin;
      return `${origin}/api/projects/videos/${id}`;
    } else {
      // Development: return relative URL for proxy
      return `/api/projects/videos/${id}`;
    }
  }

  /**
   * Get proper video URL using the same logic as getImageUrl
   */
  getVideoUrlFromProjectVideo(video: any): string {
    if (video.videoUrl) {
      return video.videoUrl.startsWith('http')
        ? video.videoUrl
        : this.getVideoUrl(video.id);
    }
    return '';
  }

  /**
   * Construct proper video URL from backend response
   */
  constructVideoUrl(videoUrl: string): string {
    if (!videoUrl) return '';

    // If already absolute URL, return as is
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl;
    }

    // In production, always use absolute URLs
    if (environment.production) {
      const baseUrl = 'https://elzahygroupback.premiumasp.net';

      // Handle absolute paths
      if (videoUrl.startsWith('/')) {
        return `${baseUrl}${videoUrl}`;
      }

      // Handle GUID or relative paths
      return `${baseUrl}/api/projects/videos/${videoUrl}`;
    }

    // In development, use relative URLs
    if (videoUrl.startsWith('/')) {
      return videoUrl;
    }

    return `/api/projects/videos/${videoUrl}`;
  }

  getImageBlob(imageId: string | number): Observable<Blob> {
    const id = imageId.toString();
    return this.http.get(`${this.baseUrl}/images/${id}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  getVideoBlob(videoId: string | number): Observable<Blob> {
    const id = videoId.toString();
    return this.http.get(`${this.baseUrl}/videos/${id}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  // Upload project image
  uploadProjectImage(projectId: string | number, file: File): Observable<any> {
    const id = projectId.toString();
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/images`, formData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Upload project video
  uploadProjectVideo(projectId: string | number, file: File): Observable<any> {
    const id = projectId.toString();
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/videos`, formData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Delete project image
  deleteProjectImage(projectId: string | number, imageId: string | number): Observable<void> {
    const pId = projectId.toString();
    const iId = imageId.toString();
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${pId}/images/${iId}`)
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  // Delete project video
  deleteProjectVideo(projectId: string | number, videoId: string | number): Observable<void> {
    const pId = projectId.toString();
    const vId = videoId.toString();
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${pId}/videos/${vId}`)
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  // Missing endpoints from API guide

  // Get projects by status (alternative endpoint)
  getProjectsByStatusPath(status: string, options: { page?: number; pageSize?: number; language?: string } = {}): Observable<PaginatedResponse<ProjectDto>> {
    const { page = 1, pageSize = 12, language } = options;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (language) {
      params = params.set('language', language);
    }

    return this.http.get<ApiResponse<PaginatedResponse<ProjectDto>>>(`${this.baseUrl}/by-status/${status}`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Search projects
  searchProjects(searchTerm: string, options: { page?: number; pageSize?: number; language?: string; status?: string } = {}): Observable<PaginatedResponse<ProjectDto>> {
    const { page = 1, pageSize = 12, language, status } = options;
    let params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (language) {
      params = params.set('language', language);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PaginatedResponse<ProjectDto>>>(`${this.baseUrl}/search`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get projects by property type
  getProjectsByPropertyType(propertyType: string, options: { page?: number; pageSize?: number; language?: string } = {}): Observable<PaginatedResponse<ProjectDto>> {
    const { page = 1, pageSize = 12, language } = options;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (language) {
      params = params.set('language', language);
    }

    return this.http.get<ApiResponse<PaginatedResponse<ProjectDto>>>(`${this.baseUrl}/by-property-type/${propertyType}`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get projects by location
  getProjectsByLocation(location: string, options: { page?: number; pageSize?: number; language?: string } = {}): Observable<PaginatedResponse<ProjectDto>> {
    const { page = 1, pageSize = 12, language } = options;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (language) {
      params = params.set('language', language);
    }

    return this.http.get<ApiResponse<PaginatedResponse<ProjectDto>>>(`${this.baseUrl}/by-location/${location}`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Toggle featured status (admin)
  toggleFeatured(projectId: string | number): Observable<ProjectDto> {
    const id = projectId.toString();
    return this.http.put<ApiResponse<ProjectDto>>(`${this.baseUrl}/${id}/toggle-featured`, {})
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Add project image (with specific parameters)
  addProjectImage(projectId: string | number, imageFile: File, description?: string, isMainImage: boolean = false): Observable<any> {
    const id = projectId.toString();
    const formData = new FormData();
    formData.append('image', imageFile);
    if (description) {
      formData.append('description', description);
    }
    formData.append('isMainImage', isMainImage.toString());

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/images`, formData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Set main image
  setMainImage(projectId: string | number, imageId: string | number): Observable<ProjectDto> {
    const pId = projectId.toString();
    const iId = imageId.toString();

    return this.http.put<ApiResponse<ProjectDto>>(`${this.baseUrl}/${pId}/images/${iId}/set-main`, {})
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Add project video (with specific parameters)
  addProjectVideo(projectId: string | number, videoFile: File, description?: string, isMainVideo: boolean = false): Observable<any> {
    const id = projectId.toString();
    const formData = new FormData();
    formData.append('video', videoFile);
    if (description) {
      formData.append('description', description);
    }
    formData.append('isMainVideo', isMainVideo.toString());

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/videos`, formData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Set main video
  setMainVideo(projectId: string | number, videoId: string | number): Observable<ProjectDto> {
    const pId = projectId.toString();
    const vId = videoId.toString();

    return this.http.put<ApiResponse<ProjectDto>>(`${this.baseUrl}/${pId}/videos/${vId}/set-main`, {})
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Delete project image (alternative endpoint according to API guide)
  deleteProjectImageDirect(imageId: string | number): Observable<void> {
    const id = imageId.toString();
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/images/${id}`)
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  // Delete project video (alternative endpoint according to API guide)
  deleteProjectVideoDirect(videoId: string | number): Observable<void> {
    const id = videoId.toString();
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/videos/${id}`)
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  // Upsert project translation (API guide format)
  upsertProjectTranslation(projectId: string | number, translation: ProjectTranslationUpsertDto): Observable<ProjectDto> {
    const id = projectId.toString();

    return this.http.post<ApiResponse<ProjectDto>>(`${this.baseUrl}/${id}/translations`, translation)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Delete project translation by language (API guide format)
  deleteProjectTranslationByLanguage(projectId: string | number, language: string): Observable<ProjectDto> {
    const id = projectId.toString();

    return this.http.delete<ApiResponse<ProjectDto>>(`${this.baseUrl}/${id}/translations/${language}`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get project statistics (admin)
  getProjectStatistics(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/stats`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Utility methods for project display
  getProjectTitle(project: ProjectDto, language: string = 'en'): string {
    if (!project) return '';

    const translation = project.translations?.find(t => t.language === language);
    return translation?.title || project.name || '';
  }

  getProjectDescription(project: ProjectDto, language: string = 'en'): string {
    if (!project) return '';

    const translation = project.translations?.find(t => t.language === language);
    return translation?.description || project.description || '';
  }

  formatProjectPrice(price: number, currency: string = 'USD'): string {
    if (!price) return '';

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });

    return formatter.format(price);
  }

  isProjectFeatured(project: ProjectDto): boolean {
    return project?.isFeatured || false;
  }

  getProjectStatusText(status: ProjectStatus): string {
    const statusMap: Record<ProjectStatus, string> = {
      [ProjectStatus.Current]: 'Current',
      [ProjectStatus.Future]: 'Future',
      [ProjectStatus.Past]: 'Past'
    };

    return statusMap[status] || 'Unknown';
  }

  // Private helper methods
  private buildProjectFormData(projectData: CreateProjectFormRequestDto | UpdateProjectFormRequestDto, isUpdate: boolean = false): FormData {
    const formData = new FormData();

    console.log('🔧 Building FormData with projectData:', projectData);

    // Basic project fields (API expects capitalized field names)
    // Always add required fields
    formData.append('Name', projectData.name || '');
    formData.append('Description', projectData.description || '');

    console.log('✅ Added required fields - Name:', projectData.name, 'Description:', projectData.description);
    if (projectData.projectUrl) formData.append('ProjectUrl', projectData.projectUrl);
    if (projectData.gitHubUrl) formData.append('GitHubUrl', projectData.gitHubUrl);
    if (projectData.companyUrl) formData.append('CompanyUrl', projectData.companyUrl);
    if (projectData.googleMapsUrl) formData.append('GoogleMapsUrl', projectData.googleMapsUrl);
    if (projectData.location) formData.append('Location', projectData.location);
    if (projectData.propertyType) formData.append('PropertyType', projectData.propertyType);
    if (projectData.totalUnits !== undefined && projectData.totalUnits !== null) {
      formData.append('TotalUnits', projectData.totalUnits.toString());
    }
    if (projectData.projectArea !== undefined && projectData.projectArea !== null) {
      formData.append('ProjectArea', projectData.projectArea.toString());
    }
    if (projectData.priceStart !== undefined && projectData.priceStart !== null) {
      formData.append('PriceStart', projectData.priceStart.toString());
    }
    if (projectData.priceEnd !== undefined && projectData.priceEnd !== null) {
      formData.append('PriceEnd', projectData.priceEnd.toString());
    }
    if (projectData.priceCurrency) formData.append('PriceCurrency', projectData.priceCurrency);
    if (projectData.technologiesUsed) formData.append('TechnologiesUsed', projectData.technologiesUsed);
    if (projectData.startDate) formData.append('StartDate', projectData.startDate);
    if (projectData.endDate) formData.append('EndDate', projectData.endDate);
    if (projectData.client) formData.append('Client', projectData.client);
    if (projectData.budget !== undefined && projectData.budget !== null) {
      formData.append('Budget', projectData.budget.toString());
    }
    if (projectData.status !== undefined && projectData.status !== null) {
      formData.append('Status', this.convertStatusToNumber(projectData.status).toString());
    }
    if (projectData.isPublished !== undefined) {
      formData.append('IsPublished', projectData.isPublished.toString());
    }
    if (projectData.isFeatured !== undefined) {
      formData.append('IsFeatured', projectData.isFeatured.toString());
    }
    if (projectData.sortOrder !== undefined && projectData.sortOrder !== null) {
      formData.append('SortOrder', projectData.sortOrder.toString());
    }

    // Handle images based on DTO type
    if ('images' in projectData && projectData.images && projectData.images.length > 0) {
      // CreateProjectFormRequestDto
      projectData.images.forEach((file) => {
        formData.append(`Images`, file);
      });
      if (projectData.mainImageIndex !== undefined) {
        formData.append('MainImageIndex', projectData.mainImageIndex.toString());
      }
    }

    if ('newImages' in projectData && projectData.newImages && projectData.newImages.length > 0) {
      // UpdateProjectFormRequestDto
      projectData.newImages.forEach((file) => {
        formData.append(`NewImages`, file);
      });
    }

    if ('removeImageIds' in projectData && projectData.removeImageIds && projectData.removeImageIds.length > 0) {
      projectData.removeImageIds.forEach((id, index) => {
        formData.append(`RemoveImageIds[${index}]`, id);
      });
    }

    if ('mainImageId' in projectData && projectData.mainImageId) {
      formData.append('MainImageId', projectData.mainImageId);
    }

    // Handle videos based on DTO type
    if ('videos' in projectData && projectData.videos && projectData.videos.length > 0) {
      // CreateProjectFormRequestDto
      projectData.videos.forEach((file) => {
        formData.append(`Videos`, file);
      });
      if (projectData.mainVideoIndex !== undefined) {
        formData.append('MainVideoIndex', projectData.mainVideoIndex.toString());
      }
    }

    if ('newVideos' in projectData && projectData.newVideos && projectData.newVideos.length > 0) {
      // UpdateProjectFormRequestDto
      projectData.newVideos.forEach((file) => {
        formData.append(`NewVideos`, file);
      });
    }

    if ('removeVideoIds' in projectData && projectData.removeVideoIds && projectData.removeVideoIds.length > 0) {
      projectData.removeVideoIds.forEach((id, index) => {
        formData.append(`RemoveVideoIds[${index}]`, id);
      });
    }

    if ('mainVideoId' in projectData && projectData.mainVideoId) {
      formData.append('MainVideoId', projectData.mainVideoId);
    }

    // Translations array
    if (projectData.translations && projectData.translations.length > 0) {
      projectData.translations.forEach((translation, index) => {
        formData.append(`Translations[${index}].Language`, translation.language);
        formData.append(`Translations[${index}].Direction`, translation.direction);
        if (translation.title) formData.append(`Translations[${index}].Title`, translation.title);
        if (translation.description) formData.append(`Translations[${index}].Description`, translation.description);
      });
    }

    // Debug: Log all FormData entries
    console.log('📤 Final FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    return formData;
  }

  private convertStatusToNumber(status: ProjectStatus | string | number): number {
    if (typeof status === 'number') return status;

    const statusMap: Record<string, number> = {
      'Current': 0,
      'Future': 1,
      'Past': 2
    };

    if (typeof status === 'string') {
      return statusMap[status] ?? 0;
    }

    // Handle enum values
    return Number(status) || 0;
  }

  private convertDirectionToNumber(direction: string): number {
    const directionMap: Record<string, number> = {
      'ltr': 0,
      'rtl': 1,
      'en': 0,
      'ar': 1
    };

    return directionMap[direction.toLowerCase()] ?? 0;
  }

  private handleError = (error: any): Observable<never> => {
    console.error('ProjectsService Error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      // Handle validation errors
      const validationErrors = Object.values(error.error.errors).flat();
      errorMessage = validationErrors.join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    }

    return throwError(() => new Error(errorMessage));
  };
}
