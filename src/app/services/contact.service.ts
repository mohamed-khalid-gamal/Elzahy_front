import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../core/services/api.service';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import {
  ContactMessage,
  CreateContactRequest,
  ContactMessageFilter,
  PagedResponse,
  ApiResponse
} from '../shared/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly endpoint = '/Contact';
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Submit contact form (public endpoint)
   */
  submitContact(message: CreateContactRequest): Observable<ContactMessage> {
    return this.http.post<ApiResponse<ContactMessage>>(`${this.baseUrl}${this.endpoint}`, message)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get single contact message by ID (admin only)
   */
  getContactMessage(id: string): Observable<ContactMessage> {
    return this.http.get<ApiResponse<ContactMessage>>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get contact messages with filters (admin only)
   */
  getContactMessages(filter: ContactMessageFilter = {}): Observable<PagedResponse<ContactMessage>> {
    const params: any = {};

    if (filter.fromDate) params.FromDate = filter.fromDate;
    if (filter.toDate) params.ToDate = filter.toDate;
    if (filter.isRead !== undefined) params.IsRead = filter.isRead;
    if (filter.isReplied !== undefined) params.IsReplied = filter.isReplied;
    if (filter.sortBy) params.SortBy = filter.sortBy;
    if (filter.sortDescending !== undefined) params.SortDescending = filter.sortDescending;
    if (filter.page !== undefined) params.Page = filter.page;
    if (filter.pageSize !== undefined) params.PageSize = filter.pageSize;

    return this.http.get<ApiResponse<PagedResponse<ContactMessage>>>(`${this.baseUrl}${this.endpoint}`, { params })
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Alias for getContactMessages (for compatibility)
   */
  getMessages(filter: ContactMessageFilter = {}): Observable<PagedResponse<ContactMessage>> {
    return this.getContactMessages(filter);
  }

  /**
   * Mark contact message as read (admin only)
   */
  markAsRead(id: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}${this.endpoint}/${id}/mark-read`, {})
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Mark contact message as replied (admin only)
   */
  markAsReplied(id: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}${this.endpoint}/${id}/mark-replied`, {})
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete contact message (admin only)
   */
  deleteContactMessage(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Alias for deleteContactMessage (for compatibility)
   */
  deleteMessage(id: string): Observable<boolean> {
    return this.deleteContactMessage(id);
  }

  /**
   * Update contact message (admin only)
   */
  updateMessage(id: string, updates: { isRead?: boolean; isReplied?: boolean; adminNotes?: string }): Observable<ContactMessage> {
    return this.http.put<ApiResponse<ContactMessage>>(`${this.baseUrl}${this.endpoint}/${id}`, updates)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(error => this.handleError(error))
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
}
