import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectsService } from '../../../services/projects.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { UploadProgressComponent } from '../../../shared/components/upload-progress/upload-progress.component';
import { ProjectDto, ProjectStatus, CreateProjectFormRequestDto, UpdateProjectFormRequestDto, ProjectImageDto } from '../../../shared/types/api.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ImageCompressionService } from '../../../services/image-compression.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent, UploadProgressComponent],
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
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Property Type</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Price Range</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Published</th>
                  <th class="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr *ngFor="let project of projects" class="hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <div *ngIf="project.mainImage" class="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                        <!-- Image Display -->
                        <div *ngIf="isImageFile(project.mainImage)">
                          <img [src]="getImageUrl(project.mainImage)"
                               [alt]="project.name" class="w-full h-full object-cover">
                        </div>

                        <!-- Video Display -->
                        <div *ngIf="isVideoFile(project.mainImage)">
                          <video class="w-full h-full object-cover" [muted]="true" [controls]="false">
                            <source [src]="getVideoUrl(project.mainImage)" type="video/mp4">
                            <source [src]="getVideoUrl(project.mainImage)" type="video/webm">
                            <source [src]="getVideoUrl(project.mainImage)" type="video/ogg">
                          </video>
                          <!-- Video overlay icon -->
                          <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" class="opacity-80">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
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
                  <td class="px-6 py-4 text-gray-300">{{ project.location || 'N/A' }}</td>
                  <td class="px-6 py-4 text-gray-300">{{ project.propertyType || 'N/A' }}</td>
                  <td class="px-6 py-4 text-gray-300">
                    <div *ngIf="project.priceStart && project.priceEnd" class="text-sm">
                      {{ project.priceStart | currency:project.priceCurrency:'symbol':'1.0-0' }} -
                      {{ project.priceEnd | currency:project.priceCurrency:'symbol':'1.0-0' }}
                    </div>
                    <div *ngIf="!project.priceStart || !project.priceEnd" class="text-sm">N/A</div>
                  </td>
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
                  <td colspan="7" class="px-6 py-8 text-center text-gray-400">
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
              <div>
                <h3 class="text-xl font-bold text-white">{{ isEditing ? 'Edit Project' : 'Create Project' }}</h3>
                <div *ngIf="isEditing && currentProject" class="text-sm text-gray-400 mt-1">
                  Editing: {{ currentProject.name }}
                </div>
              </div>
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
                  <label class="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    formControlName="location"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Cairo, Egypt"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Property Type</label>
                  <select
                    formControlName="propertyType"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Property Type</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Retail">Retail</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Total Units</label>
                  <input
                    type="number"
                    formControlName="totalUnits"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Project Area (sqm)</label>
                  <input
                    type="number"
                    step="0.01"
                    formControlName="projectArea"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000.00"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="number"
                    step="0.01"
                    formControlName="budget"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Price Start</label>
                  <input
                    type="number"
                    step="0.01"
                    formControlName="priceStart"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000000.00"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Price End</label>
                  <input
                    type="number"
                    step="0.01"
                    formControlName="priceEnd"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000000.00"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                  <select
                    formControlName="priceCurrency"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Currency</option>
                    <option value="EGP">EGP - Egyptian Pound</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Company URL</label>
                  <input
                    type="url"
                    formControlName="companyUrl"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://company.com"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Google Maps URL</label>
                  <input
                    type="url"
                    formControlName="googleMapsUrl"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Project URL</label>
                <input
                  type="url"
                  formControlName="projectUrl"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://project-website.com"
                >
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

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="isPublished"
                    class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-300">Published</span>
                </label>

                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="isFeatured"
                    class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-300">Featured</span>
                </label>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                  <input
                    type="number"
                    formControlName="sortOrder"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Media Files (Images & Videos) *
                  <span class="text-xs text-gray-500 ml-2">(At least 1 media file required)</span>
                </label>
                <div class="text-xs text-gray-500 mb-3 space-y-1">
                  <div>Supported formats: Images (JPG, PNG, GIF, WebP, etc.) up to 10MB | Videos (MP4, WebM, OGG, etc.) up to 100MB</div>
                  <div class="flex items-center space-x-4">
                    <span>💡 Tips:</span>
                    <span>Click to select • Drag to reorder • Hover for actions</span>
                  </div>
                </div>

                <!-- Existing Media Files (when editing) -->
                <div *ngIf="isEditing && existingImages.length > 0" class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-sm text-gray-400">Current Media Files ({{ existingImages.length }})</div>
                    <div class="flex space-x-2">
                      <button type="button"
                              (click)="toggleSelectAllExistingFiles()"
                              class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-400 hover:border-blue-300 transition-colors">
                        {{ selectedExistingFiles.length === existingImages.length ? 'Deselect All' : 'Select All' }}
                      </button>
                      <button type="button"
                              *ngIf="selectedExistingFiles.length > 0"
                              (click)="removeSelectedExistingFiles()"
                              [disabled]="getTotalMediaCount() - selectedExistingFiles.length < 1"
                              class="text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:border-gray-500 text-xs px-2 py-1 rounded border border-red-400 hover:border-red-300 disabled:border-gray-500 transition-colors"
                              [title]="getTotalMediaCount() - selectedExistingFiles.length < 1 ? 'At least 1 media file must remain' : 'Remove selected files'">
                        Remove Selected ({{ selectedExistingFiles.length }})
                      </button>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div *ngFor="let media of existingImages; let mediaIndex = index"
                         class="relative group cursor-pointer"
                         (click)="toggleExistingFileSelection(media.id)"
                         [class.ring-2]="isExistingFileSelected(media.id)"
                         [class.ring-blue-500]="isExistingFileSelected(media.id)"
                         [class.bg-blue-500/10]="isExistingFileSelected(media.id)">
                      <!-- Selection checkbox -->
                      <div class="absolute top-1 left-1 z-10">
                        <input type="checkbox"
                               [checked]="isExistingFileSelected(media.id)"
                               (click)="$event.stopPropagation(); toggleExistingFileSelection(media.id)"
                               class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                      </div>

                      <!-- Image Preview -->
                      <div *ngIf="isImageFile(media)" class="w-full h-20 rounded-lg overflow-hidden">
                        <img [src]="getImageUrl(media)"
                             class="w-full h-full object-cover border"
                             [class.border-blue-500]="isExistingFileSelected(media.id) || mainImageId === media.id"
                             [class.border-2]="mainImageId === media.id"
                             [class.border-gray-600]="!isExistingFileSelected(media.id) && mainImageId !== media.id"
                             [alt]="media.description || 'Project image'">
                      </div>

                      <!-- Video Preview -->
                      <div *ngIf="isVideoFile(media)" class="w-full h-20 rounded-lg overflow-hidden bg-gray-800 border"
                           [class.border-blue-500]="isExistingFileSelected(media.id) || mainImageId === media.id"
                           [class.border-2]="mainImageId === media.id"
                           [class.border-gray-600]="!isExistingFileSelected(media.id) && mainImageId !== media.id">
                        <video class="w-full h-full object-cover" [muted]="true" [controls]="false">
                          <source [src]="getVideoUrl(media)" type="video/mp4">
                          <source [src]="getVideoUrl(media)" type="video/webm">
                          <source [src]="getVideoUrl(media)" type="video/ogg">
                        </video>
                        <!-- Video overlay icon -->
                        <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" class="opacity-80">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>

                      <!-- Main media indicator -->
                      <div *ngIf="mainImageId === media.id"
                           class="absolute top-6 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                        Main
                      </div>

                      <!-- Media type indicator -->
                      <div class="absolute bottom-1 left-1">
                        <span *ngIf="isVideoFile(media)" class="bg-purple-600 text-white text-xs px-1 rounded">
                          Video
                        </span>
                        <span *ngIf="isImageFile(media)" class="bg-green-600 text-white text-xs px-1 rounded">
                          Image
                        </span>
                      </div>

                      <!-- Media actions -->
                      <div class="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button *ngIf="mainImageId !== media.id && isImageFile(media)"
                                type="button"
                                (click)="$event.stopPropagation(); setMainImage(media.id)"
                                class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-1 py-0.5 rounded"
                                title="Set as main image">
                          Main
                        </button>
                        <button type="button"
                                (click)="$event.stopPropagation(); deleteExistingImage(media.id)"
                                [disabled]="getTotalMediaCount() <= 1"
                                class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs px-1 py-0.5 rounded"
                                title="Delete media">
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- New Images/Videos Upload -->
                <input
                  type="file"
                  (change)="onFileSelected($event)"
                  multiple
                  accept="image/*,video/*"
                  [disabled]="isCompressing"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >

                <!-- Compression Progress -->
                <div *ngIf="isCompressing" class="mt-3">
                  <div class="flex items-center justify-between text-sm text-gray-400 mb-1">
                    <span>Processing media files...</span>
                    <span>{{ compressionProgress.toFixed(0) }}%</span>
                  </div>
                  <div class="w-full bg-gray-600 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                         [style.width.%]="compressionProgress"></div>
                  </div>
                </div>

                <!-- New Media Previews -->
                <div *ngIf="previewUrls.length > 0 && !isCompressing" class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-sm text-gray-400">New Media Files to Upload ({{ previewUrls.length }})</div>
                    <div class="flex space-x-2">
                      <button type="button"
                              (click)="toggleSelectAllNewFiles()"
                              class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-400 hover:border-blue-300 transition-colors">
                        {{ selectedNewFiles.length === previewData.length ? 'Deselect All' : 'Select All' }}
                      </button>
                      <button type="button"
                              *ngIf="selectedNewFiles.length > 0"
                              (click)="removeSelectedNewFiles()"
                              class="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-400 hover:border-red-300 transition-colors">
                        Remove Selected ({{ selectedNewFiles.length }})
                      </button>
                      <button type="button"
                              (click)="clearSelectedFiles()"
                              class="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-400 hover:border-red-300 transition-colors">
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div *ngFor="let item of previewData; let i = index"
                         class="relative group cursor-pointer transition-all duration-200"
                         (click)="toggleNewFileSelection(i)"
                         [class.ring-2]="isNewFileSelected(i)"
                         [class.ring-blue-500]="isNewFileSelected(i)"
                         [class.bg-blue-500/10]="isNewFileSelected(i)"
                         draggable="true"
                         (dragstart)="onDragStart($event, i)"
                         (dragover)="onDragOver($event)"
                         (drop)="onDrop($event, i)"
                         [class.opacity-50]="draggedIndex === i"
                         [class.scale-105]="draggedIndex !== null && draggedIndex !== i">

                      <!-- Selection checkbox -->
                      <div class="absolute top-1 left-1 z-10">
                        <input type="checkbox"
                               [checked]="isNewFileSelected(i)"
                               (click)="$event.stopPropagation(); toggleNewFileSelection(i)"
                               class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500">
                      </div>

                      <!-- Image Preview -->
                      <div *ngIf="item.type === 'image'" class="w-full h-20 rounded-lg overflow-hidden">
                        <img [src]="item.url"
                             class="w-full h-full object-cover border"
                             [class.border-blue-500]="isNewFileSelected(i)"
                             [class.border-green-500]="!isNewFileSelected(i)"
                             [alt]="'New image ' + (i + 1)">
                      </div>

                      <!-- Video Preview -->
                      <div *ngIf="item.type === 'video'" class="w-full h-20 rounded-lg overflow-hidden bg-gray-800 border"
                           [class.border-blue-500]="isNewFileSelected(i)"
                           [class.border-green-500]="!isNewFileSelected(i)">
                        <video class="w-full h-full object-cover" [muted]="true" [controls]="false">
                          <source [src]="item.url" type="video/mp4">
                          <source [src]="item.url" type="video/webm">
                          <source [src]="item.url" type="video/ogg">
                        </video>
                        <!-- Video overlay icon -->
                        <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" class="opacity-80">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>

                      <!-- File type indicator -->
                      <div class="absolute bottom-1 left-1">
                        <span *ngIf="item.type === 'video'" class="bg-purple-600 text-white text-xs px-1 rounded">
                          Video
                        </span>
                        <span *ngIf="item.type === 'image'" class="bg-green-600 text-white text-xs px-1 rounded">
                          Image
                        </span>
                      </div>

                      <!-- Individual remove button -->
                      <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button"
                                (click)="$event.stopPropagation(); removeNewFile(i)"
                                class="bg-red-600 hover:bg-red-700 text-white text-xs px-1 py-0.5 rounded-full"
                                title="Remove this file">
                          ✕
                        </button>
                      </div>

                      <!-- Drag handle -->
                      <div class="absolute bottom-1 right-1 flex items-center space-x-1">
                        <div class="bg-gray-600 text-white text-xs px-1 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                             title="Drag to reorder">
                          ⋮⋮
                        </div>
                        <div class="bg-green-600 text-white text-xs px-1 rounded">
                          {{ i + 1 }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="text-xs text-gray-500 mt-2">
                    <div class="flex items-center justify-between">
                      <span>Media files processed for upload (Images optimized, Videos ready)</span>
                      <span *ngIf="selectedNewFiles.length > 0" class="text-blue-400">
                        {{ selectedNewFiles.length }} of {{ previewData.length }} selected
                      </span>
                    </div>
                    <div *ngIf="draggedIndex !== null" class="mt-1 text-blue-400 font-medium">
                      Drag and drop to reorder files
                    </div>
                  </div>
                </div>

                <!-- Media Count Warning -->
                <div *ngIf="getTotalMediaCount() === 0" class="mt-2 text-red-400 text-sm">
                  ⚠️ At least 1 media file is required
                </div>

                <!-- Total Media Count -->
                <div *ngIf="getTotalMediaCount() > 0" class="mt-2 text-gray-400 text-sm">
                  Total media files: {{ getTotalMediaCount() }}
                </div>

                <!-- Media Management Summary -->
                <div *ngIf="isEditing && (imagesToDelete.length > 0 || selectedNewFiles.length > 0 || selectedExistingFiles.length > 0)"
                     class="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div class="text-sm font-medium text-gray-300 mb-2">Pending Changes:</div>
                  <div class="space-y-1 text-xs text-gray-400">
                    <div *ngIf="imagesToDelete.length > 0" class="flex items-center">
                      <svg class="w-3 h-3 mr-1 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5l1.5 1.5A1 1 0 0118 14v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a1 1 0 01.293-.707L4 11.5V5z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-red-400">{{ imagesToDelete.length }} existing file(s) will be deleted</span>
                    </div>
                    <div *ngIf="compressedFiles.length > 0" class="flex items-center">
                      <svg class="w-3 h-3 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-green-400">{{ compressedFiles.length }} new file(s) will be added</span>
                    </div>
                    <div *ngIf="selectedExistingFiles.length > 0" class="flex items-center">
                      <svg class="w-3 h-3 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-blue-400">{{ selectedExistingFiles.length }} existing file(s) selected for review</span>
                    </div>
                    <div *ngIf="selectedNewFiles.length > 0" class="flex items-center">
                      <svg class="w-3 h-3 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-blue-400">{{ selectedNewFiles.length }} new file(s) selected for review</span>
                    </div>
                  </div>
                </div>
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
                  [disabled]="projectForm.invalid || loading || getTotalMediaCount() === 0"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                  [title]="getTotalMediaCount() === 0 ? 'At least 1 media file is required' : ''"
                >
                  {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Progress Modal -->
    <app-upload-progress
      [show]="isCompressing || loading"
      [title]="isCompressing ? 'Processing Media Files' : 'Creating Project'"
      [message]="isCompressing ? 'Optimizing media files for upload...' : 'Uploading project data...'"
      [progress]="isCompressing ? compressionProgress : (loading ? 50 : 0)"
      [fileProgress]="getFileProgress()"
      [canCancel]="false">
    </app-upload-progress>
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
  compressedFiles: File[] = [];
  processedImages: File[] = [];
  processedVideos: File[] = [];
  compressionProgress = 0;
  isCompressing = false;
  previewUrls: string[] = [];
  previewData: { url: string; type: 'image' | 'video'; file: File }[] = [];

  // Existing images management
  existingImages: ProjectImageDto[] = [];
  imagesToDelete: string[] = [];
  mainImageId: string | null = null;

  // New files selection management
  selectedNewFiles: number[] = [];

  // Existing files selection management
  selectedExistingFiles: string[] = [];

  // Drag and drop properties
  draggedIndex: number | null = null;

  projectForm: FormGroup;

  constructor(
    private projectsService: ProjectsService,
    private fb: FormBuilder,
    private notifications: NotificationService,
    private imageCompressionService: ImageCompressionService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      status: [0, Validators.required],
      client: [''],
      budget: [null],
      companyUrl: [''],
      googleMapsUrl: [''],
      location: [''],
      propertyType: [''],
      totalUnits: [null],
      projectArea: [null],
      priceStart: [null],
      priceEnd: [null],
      priceCurrency: [''],
      projectUrl: [''],
      startDate: [''],
      endDate: [''],
      isPublished: [false],
      isFeatured: [false],
      sortOrder: [0]
    });
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoadingProjects = true;
    this.projectsService.getProjects().subscribe({
      next: (response) => {
        console.log('📦 Admin projects component received response:', response);

        // Handle paginated response with proper validation
        if (Array.isArray(response)) {
          this.projects = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.projects = response.data;
        } else {
          console.error('❌ Invalid response format in admin projects:', response);
          this.projects = [];
        }

        console.log('✅ Admin projects loaded:', this.projects.length, 'projects');
        this.isLoadingProjects = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.projects = [];
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
      isFeatured: false,
      sortOrder: 0
    });
    this.showModal = true;
  }

  editProject(project: ProjectDto) {
    this.isEditing = true;
    this.currentProject = project;

    // Load existing images
    this.existingImages = [...(project.images || [])];
    this.imagesToDelete = [];
    this.mainImageId = project.mainImage?.id || null;

    // Convert status to form value
    let statusValue = 0;
    if (typeof project.status === 'number') {
      statusValue = project.status;
    } else if (project.status !== null && project.status !== undefined) {
      // Handle string status or enum
      const statusStr = String(project.status).toLowerCase();
      switch (statusStr) {
        case 'current':
        case '0':
          statusValue = 0;
          break;
        case 'future':
        case '1':
          statusValue = 1;
          break;
        case 'past':
        case '2':
          statusValue = 2;
          break;
        default:
          statusValue = 0;
          break;
      }
    }

    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: statusValue,
      client: project.client,
      budget: project.budget,
      companyUrl: project.companyUrl,
      googleMapsUrl: project.googleMapsUrl,
      location: project.location,
      propertyType: project.propertyType,
      totalUnits: project.totalUnits,
      projectArea: project.projectArea,
      priceStart: project.priceStart,
      priceEnd: project.priceEnd,
      priceCurrency: project.priceCurrency,
      projectUrl: project.projectUrl,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      isPublished: project.isPublished,
      isFeatured: project.isFeatured,
      sortOrder: project.sortOrder
    });

    console.log('✅ Loaded project for editing:', {
      projectName: project.name,
      statusOriginal: project.status,
      statusConverted: statusValue,
      existingMediaFiles: this.existingImages.length,
      mainMediaId: this.mainImageId
    });

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.currentProject = null;
    this.selectedFiles = null;
    this.compressedFiles = [];
    this.processedImages = [];
    this.processedVideos = [];
    this.compressionProgress = 0;
    this.isCompressing = false;
    this.clearPreviews();

    // Reset image management state
    this.existingImages = [];
    this.imagesToDelete = [];
    this.mainImageId = null;

    // Reset selection state
    this.selectedNewFiles = [];
    this.selectedExistingFiles = [];

    this.projectForm.reset();
  }
  async onFileSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      this.selectedFiles = null;
      this.compressedFiles = [];
      this.clearPreviews();
      return;
    }

    this.selectedFiles = files;
    this.isCompressing = true;
    this.compressionProgress = 0;

    try {
      // Validate files first
      const validationErrors: string[] = [];
      const fileArray = Array.from(files) as File[];
      const imageFiles: File[] = [];
      const videoFiles: File[] = [];

      fileArray.forEach((file: File, index) => {
        if (this.isImageFileType(file.type)) {
          const validation = this.imageCompressionService.validateImageFile(file, 10240); // 10MB max for images
          if (!validation.valid) {
            validationErrors.push(`Image ${index + 1}: ${validation.error}`);
          } else {
            imageFiles.push(file);
          }
        } else if (this.isVideoFileType(file.type)) {
          // Validate video files (max 100MB)
          if (file.size > 100 * 1024 * 1024) {
            validationErrors.push(`Video ${index + 1}: File size exceeds 100MB limit`);
          } else {
            videoFiles.push(file);
          }
        } else {
          validationErrors.push(`File ${index + 1}: Unsupported file type. Only images and videos are allowed.`);
        }
      });

      if (validationErrors.length > 0) {
        this.notifications.toastError(`File validation failed:\n${validationErrors.join('\n')}`);
        this.isCompressing = false;
        return;
      }

      // Clear previous previews
      this.clearPreviews();

      // Process images (compress) and videos (as-is) separately
      const processedImages: File[] = [];
      const processedVideos: File[] = [];
      let processedCount = 0;
      const totalFiles = imageFiles.length + videoFiles.length;

      // Compress images if any
      if (imageFiles.length > 0) {
        const compressedImages = await this.imageCompressionService.compressImages(
          imageFiles,
          {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            maxSizeKB: 800,
            format: 'jpeg'
          },
          (progress) => {
            const imageProgress = (progress / 100) * (imageFiles.length / totalFiles);
            this.compressionProgress = imageProgress * 100;
          }
        );
        processedImages.push(...compressedImages);
        processedCount += imageFiles.length;

        console.log(`✅ Compressed ${compressedImages.length} images`);
        compressedImages.forEach((file, index) => {
          const originalFile = imageFiles[index];
          const originalSize = originalFile.size;
          const compressedSize = file.size;
          const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
          console.log(`Image ${index + 1}: ${this.formatBytes(originalSize)} → ${this.formatBytes(compressedSize)} (${reduction}% reduction)`);
        });
      }

      // Add videos as-is (no compression needed)
      if (videoFiles.length > 0) {
        processedVideos.push(...videoFiles);
        processedCount += videoFiles.length;
        this.compressionProgress = (processedCount / totalFiles) * 100;
        console.log(`✅ Added ${videoFiles.length} videos without processing`);
      }

      // Store both images and videos separately
      this.compressedFiles = [...processedImages, ...processedVideos];
      this.processedImages = processedImages;
      this.processedVideos = processedVideos;

      // Create preview data with type information
      this.previewData = this.compressedFiles.map(file => ({
        url: this.imageCompressionService.createPreviewUrl(file),
        type: this.isImageFileType(file.type) ? 'image' as const : 'video' as const,
        file
      }));

      // Maintain backward compatibility
      this.previewUrls = this.previewData.map(item => item.url);

      console.log(`✅ Processed ${this.compressedFiles.length} media files (${processedImages.length} images, ${processedVideos.length} videos)`);

    } catch (error) {
      console.error('Error processing media files:', error);
      this.notifications.toastError('Failed to process media files. Please try again.');
      // Fallback to original files
      const fallbackFiles = Array.from(files) as File[];
      const fallbackImages = fallbackFiles.filter(f => this.isImageFileType(f.type));
      const fallbackVideos = fallbackFiles.filter(f => this.isVideoFileType(f.type));

      this.compressedFiles = fallbackFiles;
      this.processedImages = fallbackImages;
      this.processedVideos = fallbackVideos;

      // Create fallback preview data
      this.previewData = this.compressedFiles.map(file => ({
        url: this.imageCompressionService.createPreviewUrl(file),
        type: this.isImageFileType(file.type) ? 'image' as const : 'video' as const,
        file
      }));
      this.previewUrls = this.previewData.map(item => item.url);
    } finally {
      this.isCompressing = false;
    }
  }

  private clearPreviews() {
    this.previewUrls.forEach(url => this.imageCompressionService.revokePreviewUrl(url));
    this.previewUrls = [];
    this.previewData = [];
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileProgress(): { name: string; progress: number }[] {
    if (!this.selectedFiles) return [];

    const fileArray = Array.from(this.selectedFiles) as File[];
    return fileArray.map((file, index) => ({
      name: file.name,
      progress: this.isCompressing ? this.compressionProgress : 100
    }));
  }

  submitProject() {
    if (this.projectForm.invalid) {
      console.log('❌ Form is invalid:', this.projectForm.errors);
      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        if (control && control.invalid) {
          console.log(`❌ ${key} is invalid:`, control.errors);
          control.markAsTouched();
        }
      });
      return;
    }

    if (this.isCompressing) {
      this.notifications.toastWarning('Please wait for image compression to complete.');
      return;
    }

    // Validate minimum media files requirement
    if (!this.validateMinimumImages()) {
      this.notifications.toastError('At least 1 media file is required for the project.');
      return;
    }

    this.loading = true;
    const formValue = this.projectForm.value;

    // Get files to upload (use compressed files if available, otherwise selected files)
    const filesToUpload = this.compressedFiles.length > 0 ? this.compressedFiles :
                         this.selectedFiles ? Array.from(this.selectedFiles) : [];

    if (filesToUpload.length > 0) {
      console.log(`📤 Uploading ${filesToUpload.length} new media files`);
    }

    // Validate required fields
    if (!formValue.name || formValue.name.trim() === '') {
      this.notifications.toastError('Project name is required');
      this.loading = false;
      return;
    }

    if (!formValue.description || formValue.description.trim() === '') {
      this.notifications.toastError('Project description is required');
      this.loading = false;
      return;
    }

    // Create the proper DTO structure
    const projectData: CreateProjectFormRequestDto = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      status: Number(formValue.status) as ProjectStatus || ProjectStatus.Current,
      client: formValue.client && formValue.client.trim() ? formValue.client.trim() : undefined,
      budget: formValue.budget || undefined,
      companyUrl: formValue.companyUrl && formValue.companyUrl.trim() ? formValue.companyUrl.trim() : undefined,
      googleMapsUrl: formValue.googleMapsUrl && formValue.googleMapsUrl.trim() ? formValue.googleMapsUrl.trim() : undefined,
      location: formValue.location && formValue.location.trim() ? formValue.location.trim() : undefined,
      propertyType: formValue.propertyType && formValue.propertyType.trim() ? formValue.propertyType.trim() : undefined,
      totalUnits: formValue.totalUnits || undefined,
      projectArea: formValue.projectArea || undefined,
      priceStart: formValue.priceStart || undefined,
      priceEnd: formValue.priceEnd || undefined,
      priceCurrency: formValue.priceCurrency && formValue.priceCurrency.trim() ? formValue.priceCurrency.trim() : undefined,
      projectUrl: formValue.projectUrl && formValue.projectUrl.trim() ? formValue.projectUrl.trim() : undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      isPublished: Boolean(formValue.isPublished),
      isFeatured: Boolean(formValue.isFeatured),
      sortOrder: Number(formValue.sortOrder) || 0,
      images: this.processedImages.length > 0 ? this.processedImages : undefined,
      videos: this.processedVideos.length > 0 ? this.processedVideos : undefined,
      mainImageIndex: this.processedImages.length > 0 ? 0 : undefined,
      mainVideoIndex: this.processedVideos.length > 0 ? 0 : undefined
    };

    console.log('📝 Submitting project data:', {
      formValue,
      projectData,
      filesToUpload: filesToUpload.length,
      isEditing: this.isEditing
    });

    // Debug the specific required fields
    console.log('🔍 Debug required fields:', {
      name: projectData.name,
      nameType: typeof projectData.name,
      nameLength: projectData.name?.length,
      description: projectData.description,
      descriptionType: typeof projectData.description,
      descriptionLength: projectData.description?.length
    });

    if (this.isEditing && this.currentProject) {
      // For updating, use UpdateProjectFormRequestDto structure
      const updateData: UpdateProjectFormRequestDto = {
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        client: projectData.client,
        budget: projectData.budget,
        companyUrl: projectData.companyUrl,
        googleMapsUrl: projectData.googleMapsUrl,
        location: projectData.location,
        propertyType: projectData.propertyType,
        totalUnits: projectData.totalUnits,
        projectArea: projectData.projectArea,
        priceStart: projectData.priceStart,
        priceEnd: projectData.priceEnd,
        priceCurrency: projectData.priceCurrency,
        projectUrl: projectData.projectUrl,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        isPublished: projectData.isPublished,
        isFeatured: projectData.isFeatured,
        sortOrder: projectData.sortOrder,

        // Media management for updates
        newImages: this.processedImages.length > 0 ? this.processedImages : undefined,
        newVideos: this.processedVideos.length > 0 ? this.processedVideos : undefined,
        removeImageIds: this.imagesToDelete.length > 0 ? this.imagesToDelete : undefined,
        mainImageId: this.mainImageId || undefined
      };

      console.log('📝 Updating project with data:', {
        projectId: this.currentProject.id,
        newImages: updateData.newImages?.length || 0,
        newVideos: updateData.newVideos?.length || 0,
        removeMediaFiles: updateData.removeImageIds?.length || 0,
        mainMediaId: updateData.mainImageId
      });

      this.projectsService.updateProject(this.currentProject.id, updateData).subscribe({
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
      // For creating, ensure we have media files
      if (filesToUpload.length === 0) {
        this.notifications.toastError('At least 1 media file is required to create a project');
        this.loading = false;
        return;
      }

      console.log('📝 Creating project with data:', {
        images: this.processedImages.length,
        videos: this.processedVideos.length,
        totalMediaFiles: filesToUpload.length,
        projectData
      });

      this.projectsService.createProject(projectData).subscribe({
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

  // Media management methods (handles both images and videos)
  deleteExistingImage(mediaId: string) {
    // Add to delete list
    this.imagesToDelete.push(mediaId);

    // Remove from existing media list
    this.existingImages = this.existingImages.filter(media => media.id !== mediaId);

    // If this was the main image, reset main image
    if (this.mainImageId === mediaId) {
      this.mainImageId = null;
      // Set first remaining image as main if available
      const remainingImages = this.existingImages.filter(media => this.isImageFile(media));
      if (remainingImages.length > 0) {
        this.mainImageId = remainingImages[0].id;
      }
    }

    console.log('🗑️ Marked media file for deletion:', mediaId);
    this.validateMinimumImages();
  }

  setMainImage(mediaId: string) {
    // Only allow images to be set as main image
    const media = this.existingImages.find(m => m.id === mediaId);
    if (media && this.isImageFile(media)) {
      this.mainImageId = mediaId;
      console.log('🖼️ Set main image:', mediaId);
    } else {
      console.warn('⚠️ Only images can be set as main image, not videos');
    }
  }

  // Helper methods for file type detection
  isImageFileType(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  isVideoFileType(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  isImageFile(media: ProjectImageDto): boolean {
    // Check if the media file is an image based on file extension or MIME type
    if (media.imageUrl) {
      const url = media.imageUrl.toLowerCase();
      return url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') ||
             url.includes('.gif') || url.includes('.webp') || url.includes('.bmp') ||
             url.includes('.svg');
    }
    return true; // Default to image if we can't determine
  }

  isVideoFile(media: ProjectImageDto): boolean {
    // Check if the media file is a video based on file extension
    if (media.imageUrl) {
      const url = media.imageUrl.toLowerCase();
      return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') ||
             url.includes('.avi') || url.includes('.mov') || url.includes('.wmv') ||
             url.includes('.flv') || url.includes('.mkv');
    }
    return false;
  }

  getTotalMediaCount(): number {
    return this.existingImages.length + this.compressedFiles.length;
  }

  validateMinimumImages(): boolean {
    const totalMedia = this.getTotalMediaCount();
    const hasMinimumMedia = totalMedia >= 1;

    if (!hasMinimumMedia) {
      console.warn('⚠️ Minimum 1 media file required');
    }

    return hasMinimumMedia;
  }

  getImageUrl(image: ProjectImageDto): string {
    if (!image.imageUrl) {
      return '/public/no-image.svg';
    }

    // If already absolute URL, return as is
    if (image.imageUrl.startsWith('http://') || image.imageUrl.startsWith('https://')) {
      return image.imageUrl;
    }

    // In production, always use absolute URLs
    if (environment.production) {
      const baseUrl = 'https://elzahygroupback.premiumasp.net';

      // Handle absolute paths
      if (image.imageUrl.startsWith('/')) {
        return `${baseUrl}${image.imageUrl}`;
      }

      // Handle GUID or relative paths - construct proper API endpoint
      return `${baseUrl}${image.imageUrl}`;
    }

    // In development, use relative URLs
    if (image.imageUrl.startsWith('/')) {
      return image.imageUrl;
    }

    // For GUID-based images, construct API endpoint
    return `/api/projects/images/${image.imageUrl}`;
  }

  getVideoUrl(video: ProjectImageDto): string {
    if (!video.imageUrl) {
      return '';
    }

    // If already absolute URL, return as is
    if (video.imageUrl.startsWith('http://') || video.imageUrl.startsWith('https://')) {
      return video.imageUrl;
    }

    // In production, always use absolute URLs
    if (environment.production) {
      const baseUrl = 'https://elzahygroupback.premiumasp.net';

      // Handle absolute paths
      if (video.imageUrl.startsWith('/')) {
        return `${baseUrl}${video.imageUrl}`;
      }

      // Handle GUID or relative paths - construct proper API endpoint
      return `${baseUrl}/api/projects/videos/${video.imageUrl}`;
    }

    // In development, use relative URLs
    if (video.imageUrl.startsWith('/')) {
      return video.imageUrl;
    }

    // For GUID-based videos, construct API endpoint
    return `/api/projects/videos/${video.imageUrl}`;
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

  clearSelectedFiles() {
    this.selectedFiles = null;
    this.compressedFiles = [];
    this.processedImages = [];
    this.processedVideos = [];
    this.selectedNewFiles = [];
    this.clearPreviews();

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // New file selection methods
  toggleNewFileSelection(index: number) {
    const selectedIndex = this.selectedNewFiles.indexOf(index);
    if (selectedIndex > -1) {
      this.selectedNewFiles.splice(selectedIndex, 1);
    } else {
      this.selectedNewFiles.push(index);
    }
  }

  isNewFileSelected(index: number): boolean {
    return this.selectedNewFiles.includes(index);
  }

  toggleSelectAllNewFiles() {
    if (this.selectedNewFiles.length === this.previewData.length) {
      // Deselect all
      this.selectedNewFiles = [];
    } else {
      // Select all
      this.selectedNewFiles = this.previewData.map((_, index) => index);
    }
  }

  removeNewFile(index: number) {
    // Remove from preview data
    this.previewData.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.compressedFiles.splice(index, 1);

    // Update processed arrays
    this.processedImages = this.compressedFiles.filter(file => this.isImageFileType(file.type));
    this.processedVideos = this.compressedFiles.filter(file => this.isVideoFileType(file.type));

    // Update selection indices (shift down indices greater than removed index)
    this.selectedNewFiles = this.selectedNewFiles
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);

    console.log(`🗑️ Removed new file at index ${index}`);
    this.validateMinimumImages();
  }

  removeSelectedNewFiles() {
    if (this.selectedNewFiles.length === 0) return;

    // Sort indices in descending order to remove from end first
    const sortedIndices = [...this.selectedNewFiles].sort((a, b) => b - a);

    sortedIndices.forEach(index => {
      this.previewData.splice(index, 1);
      this.previewUrls.splice(index, 1);
      this.compressedFiles.splice(index, 1);
    });

    // Clear selection
    this.selectedNewFiles = [];

    // Update processed arrays
    this.processedImages = this.compressedFiles.filter(file => this.isImageFileType(file.type));
    this.processedVideos = this.compressedFiles.filter(file => this.isVideoFileType(file.type));

    console.log(`🗑️ Removed ${sortedIndices.length} selected new files`);
    this.validateMinimumImages();
  }

  // Existing file selection methods
  toggleExistingFileSelection(mediaId: string) {
    const selectedIndex = this.selectedExistingFiles.indexOf(mediaId);
    if (selectedIndex > -1) {
      this.selectedExistingFiles.splice(selectedIndex, 1);
    } else {
      this.selectedExistingFiles.push(mediaId);
    }
  }

  isExistingFileSelected(mediaId: string): boolean {
    return this.selectedExistingFiles.includes(mediaId);
  }

  toggleSelectAllExistingFiles() {
    if (this.selectedExistingFiles.length === this.existingImages.length) {
      // Deselect all
      this.selectedExistingFiles = [];
    } else {
      // Select all
      this.selectedExistingFiles = this.existingImages.map(media => media.id);
    }
  }

  removeSelectedExistingFiles() {
    if (this.selectedExistingFiles.length === 0) return;

    // Check if we would have at least 1 media file remaining
    const remainingMediaCount = this.getTotalMediaCount() - this.selectedExistingFiles.length;
    if (remainingMediaCount < 1) {
      this.notifications.toastError('At least 1 media file must remain in the project.');
      return;
    }

    // Add all selected files to delete list
    this.selectedExistingFiles.forEach(mediaId => {
      if (!this.imagesToDelete.includes(mediaId)) {
        this.imagesToDelete.push(mediaId);
      }
    });

    // Remove selected files from existing images
    this.existingImages = this.existingImages.filter(media =>
      !this.selectedExistingFiles.includes(media.id)
    );

    // Reset main image if it was deleted
    if (this.mainImageId && this.selectedExistingFiles.includes(this.mainImageId)) {
      this.mainImageId = null;
      // Set first remaining image as main if available
      const remainingImages = this.existingImages.filter(media => this.isImageFile(media));
      if (remainingImages.length > 0) {
        this.mainImageId = remainingImages[0].id;
      }
    }

    console.log(`🗑️ Marked ${this.selectedExistingFiles.length} existing files for deletion`);

    // Clear selection
    this.selectedExistingFiles = [];
    this.validateMinimumImages();
  }

  // Drag and drop methods for reordering new files
  onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', index.toString());
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();

    if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
      this.draggedIndex = null;
      return;
    }

    // Reorder the arrays
    const draggedItem = this.previewData[this.draggedIndex];
    const draggedUrl = this.previewUrls[this.draggedIndex];
    const draggedFile = this.compressedFiles[this.draggedIndex];

    // Remove from original position
    this.previewData.splice(this.draggedIndex, 1);
    this.previewUrls.splice(this.draggedIndex, 1);
    this.compressedFiles.splice(this.draggedIndex, 1);

    // Insert at new position
    this.previewData.splice(dropIndex, 0, draggedItem);
    this.previewUrls.splice(dropIndex, 0, draggedUrl);
    this.compressedFiles.splice(dropIndex, 0, draggedFile);

    // Update processed arrays
    this.processedImages = this.compressedFiles.filter(file => this.isImageFileType(file.type));
    this.processedVideos = this.compressedFiles.filter(file => this.isVideoFileType(file.type));

    // Update selection indices
    this.updateSelectionIndicesAfterReorder(this.draggedIndex, dropIndex);

    console.log(`📁 Reordered file from index ${this.draggedIndex} to ${dropIndex}`);
    this.draggedIndex = null;
  }

  private updateSelectionIndicesAfterReorder(fromIndex: number, toIndex: number) {
    const newSelection: number[] = [];

    this.selectedNewFiles.forEach(selectedIndex => {
      if (selectedIndex === fromIndex) {
        // The dragged item moves to toIndex
        newSelection.push(toIndex);
      } else if (fromIndex < toIndex) {
        // Moving forward: indices between fromIndex and toIndex shift left
        if (selectedIndex > fromIndex && selectedIndex <= toIndex) {
          newSelection.push(selectedIndex - 1);
        } else {
          newSelection.push(selectedIndex);
        }
      } else {
        // Moving backward: indices between toIndex and fromIndex shift right
        if (selectedIndex >= toIndex && selectedIndex < fromIndex) {
          newSelection.push(selectedIndex + 1);
        } else {
          newSelection.push(selectedIndex);
        }
      }
    });

    this.selectedNewFiles = newSelection;
  }
}
