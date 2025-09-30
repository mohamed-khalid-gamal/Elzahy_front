import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request with typed response
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(
        map((response: ApiResponse<T>) => this.handleSuccess<T>(response)),
        catchError(error => this.handleError(error))
      );
  }


  post<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map((response: ApiResponse<T>) => this.handleSuccess<T>(response)),
        catchError(error => this.handleError(error))
      );
  }


  put<T>(endpoint: string, data?: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        map((response: ApiResponse<T>) => this.handleSuccess<T>(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * DELETE request with typed response
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(
        map((response: ApiResponse<T>) => this.handleSuccess<T>(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * GET request without authentication headers (for public endpoints)
   */
  getPublic<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    // No custom headers to keep the request "simple" and avoid preflight
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      params: httpParams
    })
      .pipe(
        map((response: ApiResponse<T>) => this.handleSuccess<T>(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Handle successful API response
   */
  private handleSuccess<T>(response: ApiResponse<T> | any): T {
    console.log('🔍 ApiService handleSuccess - Raw response:', response);
    console.log('🔍 Response type:', typeof response);
    console.log('🔍 Response keys:', Object.keys(response || {}));

    // Handle standard ApiResponse format
    if (response && typeof response === 'object' && response.ok !== undefined) {
      if (response.ok && response.data !== undefined) {
        console.log('✅ Standard ApiResponse format detected');
        return response.data as T;
      }
      console.error('❌ ApiResponse indicates failure:', response.error);
      throw new Error(response.error?.message || 'Request failed');
    }

    // Handle direct data response (API might return data directly without wrapper)
    if (response !== null && response !== undefined) {
      console.log('⚠️ Non-standard response format, returning as-is');
      return response as T;
    }

    // Handle null/undefined response
    console.error('❌ Null/undefined response received');
    throw new Error('No data received from server');
  }

  /**
   * Handle API errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    console.error('🔍 ApiService handleError - Full error object:', error);
    console.error('🔍 Error status:', error.status);
    console.error('🔍 Error statusText:', error.statusText);
    console.error('🔍 Error url:', error.url);
    console.error('🔍 Error body:', error.error);

    if (error.error && error.error.error && error.error.error.message) {
      errorMessage = error.error.error.message;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.statusText) {
      errorMessage = error.statusText;
    }

    console.error('❌ Final error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Build HttpParams from object
   */
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }

  /**
   * Get full URL for endpoint
   */
  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}
