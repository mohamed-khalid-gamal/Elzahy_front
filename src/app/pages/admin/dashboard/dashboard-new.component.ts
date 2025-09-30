import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectsService } from '../../../services/projects.service';
import { AwardsService } from '../../../services/awards.service';
import { ContactService } from '../../../services/contact.service';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p class="text-gray-400">Welcome back, {{ user?.name || 'Admin' }}</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">Total Projects</p>
                <p class="text-2xl font-bold text-white">{{ stats.projectsCount }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-400">
                  <rect width="7" height="9" x="3" y="3" rx="1"/>
                  <rect width="7" height="5" x="14" y="3" rx="1"/>
                  <rect width="7" height="9" x="14" y="12" rx="1"/>
                  <rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/projects" class="text-blue-400 hover:text-blue-300 text-sm font-medium">View All →</a>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">Awards</p>
                <p class="text-2xl font-bold text-white">{{ stats.awardsCount }}</p>
              </div>
              <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-yellow-400">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="m20 21-16 0 2-7 12 0 2 7Z"/>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/awards" class="text-yellow-400 hover:text-yellow-300 text-sm font-medium">Manage →</a>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">Unread Messages</p>
                <p class="text-2xl font-bold text-white">{{ stats.unreadMessages }}</p>
              </div>
              <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/messages" class="text-green-400 hover:text-green-300 text-sm font-medium">Read →</a>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">Profile</p>
                <p class="text-lg font-semibold text-white">Settings</p>
              </div>
              <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/profile" class="text-purple-400 hover:text-purple-300 text-sm font-medium">Settings →</a>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              (click)="navigateTo('/admin/projects')"
              class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              <span>New Project</span>
            </button>
            <button
              (click)="navigateTo('/admin/awards')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="5"/>
                <path d="m20 21-16 0 2-7 12 0 2 7Z"/>
              </svg>
              <span>Add Award</span>
            </button>
            <button
              (click)="navigateTo('/admin/messages')"
              class="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Check Messages</span>
            </button>
            <button
              (click)="navigateTo('/admin/profile')"
              class="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>

        <!-- System Overview -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h2 class="text-xl font-bold text-white mb-6">System Overview</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-400 mb-2">{{ stats.projectsCount }}</div>
              <div class="text-gray-400">Total Projects</div>
              <div class="text-sm text-gray-500 mt-1">Portfolio projects</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-400 mb-2">{{ stats.awardsCount }}</div>
              <div class="text-gray-400">Achievements</div>
              <div class="text-sm text-gray-500 mt-1">Awards & certifications</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-400 mb-2">{{ stats.unreadMessages }}</div>
              <div class="text-gray-400">Pending Messages</div>
              <div class="text-sm text-gray-500 mt-1">Needs attention</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user: any = null;
  stats = {
    projectsCount: 0,
    awardsCount: 0,
    unreadMessages: 0
  };

  constructor(
    private authService: AuthService,
    private projectsService: ProjectsService,
    private awardsService: AwardsService,
    private contactService: ContactService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadStats();
  }

  private loadUserData() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Failed to load user data:', error);
      }
    });
  }

  private loadStats() {
    const emptyPaginatedResponse = { data: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPrevious: false, hasNext: false };

    forkJoin({
      projects: this.projectsService.getProjects().pipe(catchError(() => of(emptyPaginatedResponse))),
      awards: this.awardsService.getAwards().pipe(catchError(() => of([]))),
      messages: this.contactService.getMessages().pipe(catchError(() => of({ data: [] })))
    }).subscribe({
      next: (data) => {
        // Handle paginated projects response
        this.stats.projectsCount = Array.isArray(data.projects) ? data.projects.length : data.projects.totalCount;
        this.stats.awardsCount = data.awards.length;
        // Filter unread messages
        const unreadMessages = data.messages.data.filter((msg: any) => !msg.isRead);
        this.stats.unreadMessages = unreadMessages.length;
      },
      error: (error) => {
        console.error('Failed to load stats:', error);
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
