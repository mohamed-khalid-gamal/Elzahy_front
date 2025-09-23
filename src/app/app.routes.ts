import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects-page/projects-page.component').then(m => m.ProjectsPageComponent)
  },
  {
    path: 'project/:id',
    loadComponent: () => import('./pages/project-details-page/project-details-page.component').then(m => m.ProjectDetailsPageComponent)
  },
  {
    path: 'awards',
    loadComponent: () => import('./pages/awards-page/awards-page.component').then(m => m.AwardsPageComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about-page/about-page.component').then(m => m.AboutPageComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact-page/contact-page.component').then(m => m.ContactPageComponent)
  },

  // Auth routes (accessible to unauthenticated users)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'two-factor-setup',
    loadComponent: () => import('./features/auth/two-factor-setup/two-factor-setup.component').then(m => m.TwoFactorSetupComponent),
    canActivate: [authGuard]
  },

  // Dashboard redirect for compatibility
  {
    path: 'dashboard',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full'
  },

  // Admin routes (protected by admin guard)
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/admin/profile/admin-profile.component').then(m => m.AdminProfileComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/admin/projects/admin-projects.component').then(m => m.AdminProjectsComponent)
      },
      {
        path: 'awards',
        loadComponent: () => import('./pages/admin/awards/admin-awards.component').then(m => m.AdminAwardsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/admin/messages/admin-messages.component').then(m => m.AdminMessagesComponent)
      }
    ]
  },

  // Error routes
  {
    path: '404',
    loadComponent: () => import('./features/error/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '401',
    loadComponent: () => import('./features/error/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Redirect unknown routes to 404
  {
    path: '**',
    redirectTo: '404'
  }
];

/** Not used in NgModule build */
export {};
