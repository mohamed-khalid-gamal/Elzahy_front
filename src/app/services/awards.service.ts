import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../core/services/api.service';
import { environment } from '../../environments/environment';
import {
  Award,
  AwardDto,
  CreateAwardRequest,
  CreateAwardFormRequestDto,
  UpdateAwardFormRequestDto,
  ApiResponse
} from '../shared/types/api.types';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AwardsService {
  private readonly endpoint = '/awards';
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Get all awards with optional filters
   */
  getAwards(isPublished?: boolean): Observable<Award[]> {
    const params: any = {};
    if (isPublished !== undefined) params.isPublished = isPublished;

    // Use getPublic for published awards to avoid authentication issues
    if (isPublished === true) {
      return this.apiService.getPublic<Award[]>(this.endpoint, params);
    }

    return this.apiService.get<Award[]>(this.endpoint, params);
  }

  /**
   * Get single award by ID
   */
  getAward(id: string): Observable<Award> {
    return this.apiService.get<Award>(`${this.endpoint}/${id}`);
  }

  /**
   * Get award image as blob
   */
  getAwardImage(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.endpoint}/${id}/image`, { responseType: 'blob' });
  }

  /**
   * Get award image URL for direct use in img src
   */
  getAwardImageUrl(id: string): string {
    return `${this.baseUrl}${this.endpoint}/${id}/image`;
  }

  /**
   * Create new award with form data (supports image upload)
   */
  createAwardWithFormData(awardData: CreateAwardFormRequestDto): Observable<Award> {
    const formData = new FormData();

    // Add required fields
    formData.append('name', awardData.name);
    formData.append('givenBy', awardData.givenBy);
    formData.append('dateReceived', awardData.dateReceived);

    // Add optional fields if they exist
    if (awardData.description) {
      formData.append('description', awardData.description);
    }
    if (awardData.certificateUrl) {
      formData.append('certificateUrl', awardData.certificateUrl);
    }
    if (awardData.image) {
      formData.append('image', awardData.image);
    }
    if (awardData.isPublished !== undefined) {
      formData.append('isPublished', awardData.isPublished.toString());
    }
    if (awardData.sortOrder !== undefined) {
      formData.append('sortOrder', awardData.sortOrder.toString());
    }

    return this.http.post<ApiResponse<AwardDto>>(`${this.baseUrl}${this.endpoint}`, formData)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update existing award with form data (supports image upload)
   */
  updateAwardWithFormData(id: string, awardData: UpdateAwardFormRequestDto): Observable<Award> {
    const formData = new FormData();

    // Add fields if they exist
    if (awardData.name) {
      formData.append('name', awardData.name);
    }
    if (awardData.givenBy) {
      formData.append('givenBy', awardData.givenBy);
    }
    if (awardData.dateReceived) {
      formData.append('dateReceived', awardData.dateReceived);
    }
    if (awardData.description) {
      formData.append('description', awardData.description);
    }
    if (awardData.certificateUrl) {
      formData.append('certificateUrl', awardData.certificateUrl);
    }
    if (awardData.image) {
      formData.append('image', awardData.image);
    }
    if (awardData.removeImage) {
      formData.append('removeImage', 'true');
    }
    if (awardData.isPublished !== undefined) {
      formData.append('isPublished', awardData.isPublished.toString());
    }
    if (awardData.sortOrder !== undefined) {
      formData.append('sortOrder', awardData.sortOrder.toString());
    }

    return this.http.put<ApiResponse<AwardDto>>(`${this.baseUrl}${this.endpoint}/${id}`, formData)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create new award (legacy method using JSON)
   */
  createAward(award: CreateAwardRequest): Observable<Award> {
    return this.apiService.post<Award>(this.endpoint, award);
  }

  /**
   * Update existing award (legacy method using JSON)
   */
  updateAward(id: string, updates: Partial<CreateAwardRequest>): Observable<Award> {
    return this.apiService.put<Award>(`${this.endpoint}/${id}`, updates);
  }

  /**
   * Delete award
   */
  deleteAward(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
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
}
