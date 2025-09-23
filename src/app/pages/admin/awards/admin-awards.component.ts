import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AwardsService } from '../../../services/awards.service';
import { Award, CreateAwardRequest, UpdateAwardRequest } from '../../../shared/types/api.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-awards',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-white">Award Management</h1>
              <p class="text-gray-400 mt-2">Manage awards and achievements</p>
            </div>
            <button
              (click)="openCreateModal()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              <span>Add Award</span>
            </button>
          </div>
        </div>

        <!-- Awards List -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/5">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Award</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Given By</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Date Received</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Published</th>
                  <th class="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr *ngFor="let award of awards" class="hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <div *ngIf="award.imageData" class="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                        <img [src]="'data:' + award.imageContentType + ';base64,' + award.imageData"
                             [alt]="award.name" class="w-full h-full object-cover">
                      </div>
                      <div *ngIf="!award.imageData" class="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                          <circle cx="12" cy="8" r="5"/>
                          <path d="m20 21-16 0 2-7 12 0 2 7Z"/>
                        </svg>
                      </div>
                      <div>
                        <div class="text-white font-medium">{{ award.name }}</div>
                        <div class="text-gray-400 text-sm">{{ award.description | slice:0:60 }}...</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-300">{{ award.givenBy }}</td>
                  <td class="px-6 py-4 text-gray-300">{{ award.dateReceived | date:'mediumDate' }}</td>
                  <td class="px-6 py-4">
                    <span [ngClass]="award.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                          class="px-3 py-1 rounded-full text-xs font-semibold">
                      {{ award.isPublished ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex justify-center space-x-2">
                      <button
                        (click)="editAward(award)"
                        class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                      </button>
                      <button
                        (click)="deleteAward(award.id)"
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
                <tr *ngIf="awards.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-400">
                    No awards found. Create your first award!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Create/Edit Award Modal -->
        <div *ngIf="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-white">{{ isEditing ? 'Edit Award' : 'Create Award' }}</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <form [formGroup]="awardForm" (ngSubmit)="submitAward()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Award Name *</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter award name"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Given By *</label>
                <input
                  type="text"
                  formControlName="givenBy"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Organization or person who gave the award"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Date Received *</label>
                <input
                  type="date"
                  formControlName="dateReceived"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Award description"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Certificate URL</label>
                <input
                  type="url"
                  formControlName="certificateUrl"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://certificate-url.com"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Award Image</label>
                <input
                  type="file"
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                >
              </div>

              <div class="flex items-center justify-between">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="isPublished"
                    class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-300">Published</span>
                </label>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    formControlName="sortOrder"
                    class="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  >
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
                  [disabled]="awardForm.invalid || loading"
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
export class AdminAwardsComponent implements OnInit {
  awards: Award[] = [];
  showModal = false;
  isEditing = false;
  loading = false;
  currentAward: Award | null = null;
  selectedFile: File | null = null;

  awardForm: FormGroup;

  constructor(
    private awardsService: AwardsService,
    private fb: FormBuilder,
    private notifications: NotificationService
  ) {
    this.awardForm = this.fb.group({
      name: ['', Validators.required],
      givenBy: ['', Validators.required],
      dateReceived: ['', Validators.required],
      description: [''],
      certificateUrl: [''],
      isPublished: [false],
      sortOrder: [0]
    });
  }

  ngOnInit() {
    this.loadAwards();
  }

  loadAwards() {
    this.awardsService.getAwards().subscribe({
      next: (awards) => {
        this.awards = awards;
      },
      error: (error) => {
        console.error('Error loading awards:', error);
      }
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentAward = null;
    this.awardForm.reset();
    this.awardForm.patchValue({
      isPublished: false,
      sortOrder: 0
    });
    this.showModal = true;
  }

  editAward(award: Award) {
    this.isEditing = true;
    this.currentAward = award;

    this.awardForm.patchValue({
      name: award.name,
      givenBy: award.givenBy,
      dateReceived: new Date(award.dateReceived).toISOString().split('T')[0],
      description: award.description,
      certificateUrl: award.certificateUrl,
      isPublished: award.isPublished,
      sortOrder: award.sortOrder
    });

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.currentAward = null;
    this.selectedFile = null;
    this.awardForm.reset();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
  }

  submitAward() {
    if (this.awardForm.invalid) return;

    this.loading = true;
    const formData = new FormData();
    const formValue = this.awardForm.value;

    // Append form fields
    Object.keys(formValue).forEach(key => {
      if (formValue[key] !== null && formValue[key] !== '') {
        formData.append(key, formValue[key]);
      }
    });

    // Append image if selected
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    if (this.isEditing && this.currentAward) {
      this.awardsService.updateAward(this.currentAward.id, formData as any).subscribe({
        next: () => {
          this.loadAwards();
          this.closeModal();
          this.loading = false;
          this.notifications.toastSuccess('Award updated successfully');
        },
        error: (error) => {
          console.error('Error updating award:', error);
          this.loading = false;
          this.notifications.toastError(error?.message || 'Failed to update award');
        }
      });
    } else {
      this.awardsService.createAward(formData as any).subscribe({
        next: () => {
          this.loadAwards();
          this.closeModal();
          this.loading = false;
          this.notifications.toastSuccess('Award created successfully');
        },
        error: (error) => {
          console.error('Error creating award:', error);
          this.loading = false;
          this.notifications.toastError(error?.message || 'Failed to create award');
        }
      });
    }
  }

  async deleteAward(id: string) {
    const confirmed = await this.notifications.confirmDelete('this award');
    if (!confirmed) return;

    this.awardsService.deleteAward(id).subscribe({
      next: () => {
        this.loadAwards();
        this.notifications.toastSuccess('Award deleted');
      },
      error: (error) => {
        console.error('Error deleting award:', error);
        this.notifications.toastError(error?.message || 'Failed to delete award');
      }
    });
  }
}
