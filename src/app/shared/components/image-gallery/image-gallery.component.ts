import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectImageDto } from '../../types/api.types';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-gallery" *ngIf="images && images.length > 0" (keydown)="onKeyDown($event)" tabindex="0">
      <!-- Main image display -->
      <div class="main-image mb-4 relative">
        <img
          [src]="getImageDataUrl(selectedImage || images[0])"
          [alt]="selectedImage?.description || 'Project image'"
          [title]="selectedImage?.description || 'Project image'"
          class="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg">

        <!-- Navigation arrows (only show if multiple images) -->
        <div *ngIf="images.length > 1" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between p-4 pointer-events-none">
          <button
            (click)="previousImage()"
            class="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            [title]="'Previous image (Arrow Left)'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <button
            (click)="nextImage()"
            class="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            [title]="'Next image (Arrow Right)'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Thumbnail navigation (only show if multiple images) -->
      <div *ngIf="images.length > 1" class="thumbnails-container">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-300">Gallery ({{ images.length }} images)</h4>
          <div class="text-xs text-gray-400">
            {{ getCurrentImageIndex() + 1 }} of {{ images.length }}
          </div>
        </div>

        <div class="thumbnails flex gap-3 overflow-x-auto pb-3">
          <button
            *ngFor="let image of images; trackBy: trackByImageId"
            (click)="selectImage(image)"
            [class]="getThumbnailClasses(image)"
            class="flex-shrink-0 relative overflow-hidden rounded-md border-2 transition-all duration-200 hover:scale-105"
          >
            <img
              [src]="getImageDataUrl(image)"
              [alt]="image.description || 'Thumbnail'"
              [title]="image.description || 'Thumbnail'"
              class="w-20 h-20 object-cover">

            <!-- Main image indicator -->
            <div *ngIf="image.isMainImage"
                 class="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded shadow">
              Main
            </div>

            <!-- Selected indicator -->
            <div *ngIf="selectedImage?.id === image.id"
                 class="absolute inset-0 bg-blue-500/20 border-2 border-blue-400 rounded-md"></div>
          </button>
        </div>
      </div>

      <!-- Image info -->
      <div *ngIf="selectedImage && selectedImage.description" class="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <p class="text-sm text-gray-300">{{ selectedImage.description }}</p>
      </div>
    </div>

    <!-- No images placeholder -->
    <div *ngIf="!images || images.length === 0" class="no-images text-center py-12">
      <div class="text-gray-400">No images available</div>
    </div>
  `,
  styles: [`
    .thumbnails::-webkit-scrollbar {
      height: 4px;
    }

    .thumbnails::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 2px;
    }

    .thumbnails::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 2px;
    }

    .thumbnails::-webkit-scrollbar-thumb:hover {
      background: #a1a1a1;
    }
  `]
})
export class ImageGalleryComponent implements OnInit {
  @Input() images: ProjectImageDto[] = [];
  @Input() showThumbnails: boolean = true;

  selectedImage: ProjectImageDto | null = null;

  ngOnInit() {
    if (this.images && this.images.length > 0) {
      // Select main image first, or first image if no main image
      this.selectedImage = this.images.find(img => img.isMainImage) || this.images[0];
    }
  }

  /**
   * Navigate to next image
   */
  nextImage() {
    if (!this.images || this.images.length <= 1) return;

    const currentIndex = this.getCurrentImageIndex();
    const nextIndex = (currentIndex + 1) % this.images.length;
    this.selectedImage = this.images[nextIndex];
  }

  /**
   * Navigate to previous image
   */
  previousImage() {
    if (!this.images || this.images.length <= 1) return;

    const currentIndex = this.getCurrentImageIndex();
    const prevIndex = currentIndex === 0 ? this.images.length - 1 : currentIndex - 1;
    this.selectedImage = this.images[prevIndex];
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent) {
    if (!this.images || this.images.length <= 1) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
    }
  }

  selectImage(image: ProjectImageDto) {
    this.selectedImage = image;
  }

  getImageDataUrl(image: ProjectImageDto): string {
    if (image.imageData && image.contentType) {
      return `data:${image.contentType};base64,${image.imageData}`;
    }
    return 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=No+Image';
  }

  getThumbnailClasses(image: ProjectImageDto): string {
    const baseClasses = 'hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500';
    const selectedClasses = this.selectedImage?.id === image.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300';
    return `${baseClasses} ${selectedClasses}`;
  }

  getCurrentImageIndex(): number {
    if (!this.selectedImage) return 0;
    return this.images.findIndex(img => img.id === this.selectedImage!.id);
  }

  trackByImageId(index: number, image: ProjectImageDto): string {
    return image.id;
  }
}
