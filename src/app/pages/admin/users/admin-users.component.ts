import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import {
  AdminUserDto,
  AdminRoleRequestResponseDto,
  CreateUserRequestDto,
  ProcessAdminRequestDto
} from '../../../shared/types/api.types';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, AlertComponent],
  template: `
    <div class="pt-24 pb-8 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">User Management</h1>
          <p class="text-gray-400">Manage users and admin role requests</p>
        </div>

        <!-- Alerts -->
        <app-alert
          *ngIf="error"
          [message]="error"
          [type]="'error'"
          (dismiss)="error = null"
          class="mb-6">
        </app-alert>

        <app-alert
          *ngIf="success"
          [message]="success"
          [type]="'success'"
          (dismiss)="success = null"
          class="mb-6">
        </app-alert>

        <!-- Tabs -->
        <div class="mb-8">
          <nav class="flex space-x-8">
            <button
              (click)="activeTab = 'users'"
              [class]="activeTab === 'users' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
              All Users ({{ users.length }})
            </button>
            <button
              (click)="activeTab = 'requests'"
              [class]="activeTab === 'requests' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
              Admin Requests ({{ pendingRequests.length }})
            </button>
            <button
              (click)="activeTab = 'create'"
              [class]="activeTab === 'create' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors">
              Create User
            </button>
          </nav>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <app-loading size="large" message="Loading..."></app-loading>
        </div>

        <!-- Users Tab -->
        <div *ngIf="activeTab === 'users' && !isLoading">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-white/5">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10">
                  <tr *ngFor="let user of users" class="hover:bg-white/5">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm">
                        <div class="font-medium text-white">{{ user.name }}</div>
                        <div class="text-gray-400">{{ user.email }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getRoleClass(user.role)" class="px-2 py-1 text-xs font-semibold rounded-full">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-white">
                        <div class="flex items-center space-x-2">
                          <span [class]="user.emailConfirmed ? 'text-green-400' : 'text-yellow-400'">
                            {{ user.emailConfirmed ? 'Verified' : 'Pending' }}
                          </span>
                          <span *ngIf="user.twoFactorEnabled" class="text-blue-400 text-xs">(2FA)</span>
                          <span *ngIf="user.hasPendingAdminRequest" class="text-orange-400 text-xs">(Admin Request)</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {{ formatDate(user.createdAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        *ngIf="canDeleteUser(user)"
                        (click)="confirmDeleteUser(user)"
                        class="text-red-400 hover:text-red-300 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Admin Requests Tab -->
        <div *ngIf="activeTab === 'requests' && !isLoading">
          <div class="space-y-6">
            <div *ngFor="let request of adminRequests" class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-white">{{ request.userName }}</h3>
                  <p class="text-gray-400">{{ request.userEmail }}</p>
                  <p class="text-sm text-gray-500">Requested: {{ formatDate(request.createdAt) }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    *ngIf="request.isProcessed"
                    [class]="request.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                    class="px-3 py-1 text-xs font-semibold rounded-full">
                    {{ request.isApproved ? 'Approved' : 'Denied' }}
                  </span>
                  <span
                    *ngIf="!request.isProcessed"
                    class="bg-yellow-500/20 text-yellow-400 px-3 py-1 text-xs font-semibold rounded-full">
                    Pending
                  </span>
                </div>
              </div>

              <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Reason:</h4>
                <p class="text-white bg-white/5 p-3 rounded-lg">{{ request.reason }}</p>
              </div>

              <div *ngIf="request.additionalInfo" class="mb-4">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Additional Information:</h4>
                <p class="text-white bg-white/5 p-3 rounded-lg">{{ request.additionalInfo }}</p>
              </div>

              <div *ngIf="request.isProcessed && request.adminNotes" class="mb-4">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Admin Notes:</h4>
                <p class="text-white bg-white/5 p-3 rounded-lg">{{ request.adminNotes }}</p>
                <p class="text-sm text-gray-500 mt-2">
                  Processed by {{ request.processedByUserName }} on {{ formatDate(request.processedAt!) }}
                </p>
              </div>

              <div *ngIf="!request.isProcessed" class="flex space-x-4">
                <button
                  (click)="processRequest(request.id, true)"
                  [disabled]="isProcessing"
                  class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Approve
                </button>
                <button
                  (click)="processRequest(request.id, false)"
                  [disabled]="isProcessing"
                  class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Deny
                </button>
              </div>
            </div>

            <div *ngIf="adminRequests.length === 0" class="text-center py-12">
              <p class="text-gray-400">No admin role requests found.</p>
            </div>
          </div>
        </div>

        <!-- Create User Tab -->
        <div *ngIf="activeTab === 'create' && !isLoading">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 max-w-md">
            <h2 class="text-xl font-bold text-white mb-6">Create New User</h2>

            <form (ngSubmit)="createUser()" #createUserForm="ngForm">
              <div class="space-y-4">
                <div>
                  <label for="createName" class="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    id="createName"
                    name="createName"
                    [(ngModel)]="newUser.name"
                    #createName="ngModel"
                    required
                    class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label for="createEmail" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    id="createEmail"
                    name="createEmail"
                    [(ngModel)]="newUser.email"
                    #createEmail="ngModel"
                    required
                    email
                    class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label for="createPassword" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    id="createPassword"
                    name="createPassword"
                    [(ngModel)]="newUser.password"
                    #createPassword="ngModel"
                    required
                    minlength="8"
                    class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password (min 8 characters)"
                  />
                </div>

                <div>
                  <label for="createRole" class="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    id="createRole"
                    name="createRole"
                    [(ngModel)]="newUser.role"
                    #createRole="ngModel"
                    required
                    class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  [disabled]="createUserForm.invalid || isCreatingUser"
                  class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <span *ngIf="isCreatingUser">Creating...</span>
                  <span *ngIf="!isCreatingUser">Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div *ngIf="userToDelete" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-bold text-white mb-4">Confirm Deletion</h3>
            <p class="text-gray-300 mb-6">
              Are you sure you want to delete <strong>{{ userToDelete.name }}</strong>? This action cannot be undone.
            </p>
            <div class="flex space-x-4">
              <button
                (click)="deleteUser()"
                [disabled]="isDeleting"
                class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex-1 transition-colors">
                <span *ngIf="isDeleting">Deleting...</span>
                <span *ngIf="!isDeleting">Delete</span>
              </button>
              <button
                (click)="userToDelete = null"
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex-1 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  activeTab: 'users' | 'requests' | 'create' = 'users';
  isLoading = false;
  isProcessing = false;
  isCreatingUser = false;
  isDeleting = false;
  error: string | null = null;
  success: string | null = null;

  users: AdminUserDto[] = [];
  adminRequests: AdminRoleRequestResponseDto[] = [];
  userToDelete: AdminUserDto | null = null;

  newUser: CreateUserRequestDto = {
    name: '',
    email: '',
    password: '',
    role: 'User'
  };

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check for tab query parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab'] && ['users', 'requests', 'create'].includes(params['tab'])) {
        this.activeTab = params['tab'];
      }
    });

    this.loadData();
  }

  get pendingRequests(): AdminRoleRequestResponseDto[] {
    return this.adminRequests.filter(req => !req.isProcessed);
  }

  async loadData() {
    this.isLoading = true;
    this.error = null;

    try {
      const [users, requests] = await Promise.all([
        this.authService.getAllUsers().toPromise(),
        this.authService.getAdminRequests().toPromise()
      ]);

      this.users = users || [];
      this.adminRequests = requests || [];
    } catch (error: any) {
      this.error = error.message || 'Failed to load data';
    } finally {
      this.isLoading = false;
    }
  }

  async processRequest(requestId: string, approved: boolean) {
    this.isProcessing = true;
    this.error = null;

    try {
      const processData: ProcessAdminRequestDto = {
        approved,
        adminNotes: approved ? 'Admin role request approved.' : 'Admin role request denied.'
      };

      await this.authService.processAdminRequest(requestId, processData).toPromise();

      this.success = `Admin request ${approved ? 'approved' : 'denied'} successfully.`;
      await this.loadData();
    } catch (error: any) {
      this.error = error.message || 'Failed to process request';
    } finally {
      this.isProcessing = false;
    }
  }

  async createUser() {
    this.isCreatingUser = true;
    this.error = null;

    try {
      await this.authService.createUser(this.newUser).toPromise();

      this.success = 'User created successfully.';
      this.newUser = { name: '', email: '', password: '', role: 'User' };
      this.activeTab = 'users';
      await this.loadData();
    } catch (error: any) {
      this.error = error.message || 'Failed to create user';
    } finally {
      this.isCreatingUser = false;
    }
  }

  confirmDeleteUser(user: AdminUserDto) {
    this.userToDelete = user;
  }

  async deleteUser() {
    if (!this.userToDelete) return;

    this.isDeleting = true;
    this.error = null;

    try {
      await this.authService.deleteUser(this.userToDelete.id).toPromise();

      this.success = 'User deleted successfully.';
      this.userToDelete = null;
      await this.loadData();
    } catch (error: any) {
      this.error = error.message || 'Failed to delete user';
      this.userToDelete = null;
    } finally {
      this.isDeleting = false;
    }
  }

  canDeleteUser(user: AdminUserDto): boolean {
    // Can't delete yourself or the last admin
    const currentUser = this.tokenService.getCurrentUser();
    if (!currentUser) return false;

    return user.id !== currentUser.id && !(user.role === 'Admin' && this.getAdminCount() <= 1);
  }

  private getAdminCount(): number {
    return this.users.filter(user => user.role === 'Admin').length;
  }

  getRoleClass(role: string): string {
    return role === 'Admin'
      ? 'bg-purple-500/20 text-purple-400'
      : 'bg-blue-500/20 text-blue-400';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
