import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectsService } from '../../../services/projects.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ProjectDto, ProjectStatus, CreateProjectFormRequestDto, UpdateProjectFormRequestDto } from '../../../shared/types/api.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  template: `
    <div class="pt-24 pb-8 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-white">Project Management</h1>
              <p class="text-gray-400 mt-2">Manage portfolio projects</p>
            </div>
            <button
              (click)="openCreateModal()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              <span>Add Project</span>
            </button>
          </div>
        </div>

        <!-- Projects List -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <!-- Loading State -->
          <div *ngIf="isLoadingProjects" class="flex justify-center py-12">
            <app-loading size="large" message="Loading projects..."></app-loading>
          </div>

          <div *ngIf="!isLoadingProjects" class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/5">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Project</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Client</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Budget</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Published</th>
                  <th class="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr *ngFor="let project of projects" class="hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <div *ngIf="project.mainImage" class="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                        <img [src]="'data:' + project.mainImage.contentType + ';base64,' + project.mainImage.imageData"
                             [alt]="project.name" class="w-full h-full object-cover">
                      </div>
                      <div *ngIf="!project.mainImage" class="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                      </div>
                      <div>
                        <div class="text-white font-medium">{{ project.name }}</div>
                        <div class="text-gray-400 text-sm">{{ project.description | slice:0:60 }}...</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span [ngClass]="getStatusBadgeClass(project.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                      {{ getStatusText(project.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-300">{{ project.client || 'N/A' }}</td>
                  <td class="px-6 py-4 text-gray-300">{{ project.budget ? (project.budget | currency) : 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <span [ngClass]="project.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                          class="px-3 py-1 rounded-full text-xs font-semibold">
                      {{ project.isPublished ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex justify-center space-x-2">
                      <button
                        (click)="editProject(project)"
                        class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                      </button>
                      <button
                        (click)="deleteProject(project.id)"
                        class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="m3 6 3 0"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="projects.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                    No projects found. Create your first project!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Create/Edit Project Modal -->
        <div *ngIf="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-white">{{ isEditing ? 'Edit Project' : 'Create Project' }}</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <form [formGroup]="projectForm" (ngSubmit)="submitProject()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  formControlName="description"
                  rows="4"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Project description"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Status *</label>
                  <select
                    formControlName="status"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Current</option>
                    <option value="1">Coming in Future</option>
                    <option value="2">Completed Projects</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Client</label>
                  <input
                    type="text"
                    formControlName="client"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Client name"
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="number"
                    formControlName="budget"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Technologies Used</label>
                  <input
                    type="text"
                    formControlName="technologiesUsed"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Angular, .NET, SQL Server"
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Project URL</label>
                  <input
                    type="url"
                    formControlName="projectUrl"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
                  <input
                    type="url"
                    formControlName="gitHubUrl"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/..."
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    formControlName="startDate"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    formControlName="endDate"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="isPublished"
                    class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-300">Published</span>
                </label>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                  <input
                    type="number"
                    formControlName="sortOrder"
                    class="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Images</label>
                <input
                  type="file"
                  (change)="onFileSelected($event)"
                  multiple
                  accept="image/*"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                >
              </div>

              <div class="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="projectForm.invalid || loading"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                >
                  {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminProjectsComponent implements OnInit {
  projects: ProjectDto[] = [];
  showModal = false;
  isEditing = false;
  loading = false;
  isLoadingProjects = true;
  currentProject: ProjectDto | null = null;
  selectedFiles: FileList | null = null;

  projectForm: FormGroup;

  constructor(
    private projectsService: ProjectsService,
    private fb: FormBuilder,
    private notifications: NotificationService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      status: [0, Validators.required],
      client: [''],
      budget: [null],
      technologiesUsed: [''],
      projectUrl: [''],
      gitHubUrl: [''],
      startDate: [''],
      endDate: [''],
      isPublished: [false],
      sortOrder: [0]
    });
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoadingProjects = true;
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoadingProjects = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoadingProjects = false;
      }
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentProject = null;
    this.projectForm.reset();
    this.projectForm.patchValue({
      status: 0,
      isPublished: false,
      sortOrder: 0
    });
    this.showModal = true;
  }

  editProject(project: ProjectDto) {
    this.isEditing = true;
    this.currentProject = project;

    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: project.status,
      client: project.client,
      budget: project.budget,
      technologiesUsed: project.technologiesUsed,
      projectUrl: project.projectUrl,
      gitHubUrl: project.gitHubUrl,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      isPublished: project.isPublished,
      sortOrder: project.sortOrder
    });

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.currentProject = null;
    this.selectedFiles = null;
    this.projectForm.reset();
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  submitProject() {
    if (this.projectForm.invalid) return;

    this.loading = true;
    const formData = new FormData();
    const formValue = this.projectForm.value;

    // Append form fields
    Object.keys(formValue).forEach(key => {
      if (formValue[key] !== null && formValue[key] !== '') {
        formData.append(key, formValue[key]);
      }
    });

    // Append files
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('Images', this.selectedFiles[i]);
      }
    }

    if (this.isEditing && this.currentProject) {
      this.projectsService.updateProject(this.currentProject.id, formData as any).subscribe({
        next: () => {
          this.loadProjects();
          this.closeModal();
          this.loading = false;
          this.notifications.toastSuccess('Project updated successfully');
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.loading = false;
          this.notifications.toastError(error?.message || 'Failed to update project');
        }
      });
    } else {
      this.projectsService.createProject(formData as any).subscribe({
        next: () => {
          this.loadProjects();
          this.closeModal();
          this.loading = false;
          this.notifications.toastSuccess('Project created successfully');
        },
        error: (error) => {
          console.error('Error creating project:', error);
          this.loading = false;
          this.notifications.toastError(error?.message || 'Failed to create project');
        }
      });
    }
  }

  async deleteProject(id: string) {
    const confirmed = await this.notifications.confirmDelete('this project');
    if (!confirmed) return;

    this.projectsService.deleteProject(id).subscribe({
      next: () => {
        this.loadProjects();
        this.notifications.toastSuccess('Project deleted');
      },
      error: (error) => {
        console.error('Error deleting project:', error);
        this.notifications.toastError(error?.message || 'Failed to delete project');
      }
    });
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Current:
        return 'bg-blue-500/20 text-blue-400';
      case ProjectStatus.Future:
        return 'bg-yellow-500/20 text-yellow-400';
      case ProjectStatus.Past:
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  }

  getStatusText(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Current:
        return 'Current';
      case ProjectStatus.Future:
        return 'Future';
      case ProjectStatus.Past:
        return 'Past';
      default:
        return 'Unknown';
    }
  }
}
