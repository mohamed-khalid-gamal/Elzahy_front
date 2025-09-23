import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ApiResponse,
  AdminRoleRequestResponseDto,
  ProcessAdminRequestDto,
  CreateUserRequestDto,
  AdminUserDto,
  User
} from '../../shared/types/api.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all admin requests
   */
  getAdminRequests(): Observable<AdminRoleRequestResponseDto[]> {
    return this.http.get<ApiResponse<AdminRoleRequestResponseDto[]>>(`${this.baseUrl}/admin/requests`)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to get admin requests');
        }),
        catchError(error => {
          console.error('Admin Service Error:', error);
          throw error;
        })
      );
  }

  /**
   * Process admin request
   */
  processAdminRequest(requestId: string, request: ProcessAdminRequestDto): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/admin/requests/${requestId}/process`, request)
      .pipe(
        map(response => {
          if (response.ok && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to process admin request');
        }),
        catchError(error => {
          console.error('Admin Service Error:', error);
          throw error;
        })
      );
  }

  /**
   * Get all users
   */
  getAllUsers(): Observable<AdminUserDto[]> {
    return this.http.get<ApiResponse<AdminUserDto[]>>(`${this.baseUrl}/admin/users`)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Failed to get users');
        }),
        catchError(error => {
          console.error('Admin Service Error:', error);
          throw error;
        })
      );
  }

  /**
   * Create user
   */
  createUser(userData: CreateUserRequestDto): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/admin/users`, userData)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          throw new Error(response.error?.message || 'User creation failed');
        }),
        catchError(error => {
          console.error('Admin Service Error:', error);
          throw error;
        })
      );
  }

  /**
   * Delete user
   */
  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/admin/users/${userId}`)
      .pipe(
        map(response => {
          if (response.ok && response.data !== undefined) {
            return response.data;
          }
          throw new Error(response.error?.message || 'User deletion failed');
        }),
        catchError(error => {
          console.error('Admin Service Error:', error);
          throw error;
        })
      );
  }

  /**
   * Get dashboard statistics (if implemented)
   */
  getDashboardStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/admin/dashboard/stats`)
      .pipe(
        map(response => {
          if (response.ok && response.data) {
            return response.data;
          }
          return {};
        }),
        catchError(() => {
          // Return empty stats if endpoint doesn't exist
          return [{}];
        })
      );
  }
}
