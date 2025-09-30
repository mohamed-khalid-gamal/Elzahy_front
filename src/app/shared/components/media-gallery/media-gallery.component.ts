import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectImageDto } from '../../types/api.types';
import { environment } from '../../../../environments/environment';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  description?: string;
  isMainImage?: boolean;
  sortOrder: number;
}

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="media-gallery" *ngIf="mediaItems && mediaItems.length > 0" (keydown)="onKeyDown($event)" tabindex="0">
      <!-- Main media display -->
      <div class="main-media mb-4 relative">
        <!-- Main Image -->
        <img *ngIf="selectedMedia && selectedMedia.type === 'image'"
          [src]="selectedMedia.url"
          [alt]="selectedMedia.description || 'Project image'"
          [title]="selectedMedia.description || 'Project image'"
          loading="lazy"
          decoding="async"
          class="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg">

        <!-- Main Video -->
        <video *ngIf="selectedMedia && selectedMedia.type === 'video'"
          [src]="selectedMedia.url"
          [title]="selectedMedia.description || 'Project video'"
          class="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
          controls
          preload="metadata"
          #videoElement>
          <p class="text-gray-400 text-center p-4">Your browser does not support the video tag.</p>
        </video>

        <!-- Navigation arrows (only show if multiple media items) -->
        <div *ngIf="mediaItems.length > 1" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between p-4 pointer-events-none">
          <button
            (click)="previousMedia()"
            class="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            [title]="'Previous media (Arrow Left)'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <button
            (click)="nextMedia()"
            class="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            [title]="'Next media (Arrow Right)'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Media type indicator -->
        <div *ngIf="selectedMedia" class="absolute top-4 left-4">
          <span *ngIf="selectedMedia.type === 'video'" class="bg-purple-600/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            Video
          </span>
          <span *ngIf="selectedMedia.type === 'image'" class="bg-blue-600/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            Image
          </span>
        </div>
      </div>

      <!-- Thumbnail navigation (only show if multiple media items) -->
      <div *ngIf="mediaItems.length > 1" class="thumbnails-container">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-300">Gallery ({{ mediaItems.length }} items)</h4>
          <div class="text-xs text-gray-400">
            {{ getCurrentMediaIndex() + 1 }} of {{ mediaItems.length }}
          </div>
        </div>

        <div class="thumbnails flex gap-3 overflow-x-auto pb-3">
          <button
            *ngFor="let media of mediaItems; trackBy: trackByMediaId"
            (click)="selectMedia(media)"
            [class]="getThumbnailClasses(media)"
            class="flex-shrink-0 relative overflow-hidden rounded-md border-2 transition-all duration-200 hover:scale-105"
          >
            <!-- Image thumbnail -->
            <img *ngIf="media.type === 'image'"
              [src]="media.url"
              [alt]="media.description || 'Thumbnail'"
              [title]="media.description || 'Thumbnail'"
              loading="lazy"
              decoding="async"
              class="w-20 h-20 object-cover">

            <!-- Video thumbnail -->
            <div *ngIf="media.type === 'video'" class="w-20 h-20 bg-gray-700 flex items-center justify-center relative">
              <video [src]="media.url" class="w-full h-full object-cover" [muted]="true" preload="metadata"></video>
              <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                </svg>
              </div>
            </div>

            <!-- Main media indicator -->
            <div *ngIf="media.isMainImage"
                 class="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded shadow">
              Main
            </div>

            <!-- Media type indicator on thumbnail -->
            <div class="absolute bottom-1 left-1">
              <span *ngIf="media.type === 'video'" class="bg-purple-600 text-white text-xs px-1 rounded">
                Video
              </span>
              <span *ngIf="media.type === 'image'" class="bg-green-600 text-white text-xs px-1 rounded">
                Image
              </span>
            </div>

            <!-- Selected indicator -->
            <div *ngIf="selectedMedia?.id === media.id"
                 class="absolute inset-0 bg-blue-500/20 border-2 border-blue-400 rounded-md"></div>
          </button>
        </div>
      </div>

      <!-- Media info -->
      <div *ngIf="selectedMedia && selectedMedia.description" class="mt-3 p-3 bg-gray-800/50 rounded-lg">
        <p class="text-sm text-gray-300">{{ selectedMedia.description }}</p>
      </div>
    </div>

    <!-- No media placeholder -->
    <div *ngIf="!mediaItems || mediaItems.length === 0" class="no-media text-center py-12">
      <div class="text-gray-400">No media available</div>
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

    video::-webkit-media-controls-panel {
      background-color: rgba(0, 0, 0, 0.8);
    }
  `]
})
export class MediaGalleryComponent implements OnInit, OnDestroy {
  @Input() images: ProjectImageDto[] = [];
  @Input() videos: any[] = [];
  @Input() showThumbnails: boolean = true;

  mediaItems: MediaItem[] = [];
  selectedMedia: MediaItem | null = null;
  private keydownListener?: (event: KeyboardEvent) => void;

  ngOnInit() {
    this.processMediaItems();
    this.selectInitialMedia();

    // Add keyboard listener
    this.keydownListener = (event: KeyboardEvent) => this.onKeyDown(event);
    document.addEventListener('keydown', this.keydownListener);
  }

  ngOnDestroy() {
    // Remove keyboard listener
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  private processMediaItems() {
    this.mediaItems = [];

    // Process images
    if (this.images && this.images.length > 0) {
      this.images.forEach(image => {
        this.mediaItems.push({
          id: image.id,
          url: this.constructImageUrl(image.imageUrl),
          type: 'image',
          description: image.description,
          isMainImage: image.isMainImage,
          sortOrder: image.sortOrder
        });
      });
    }

    // Process videos
    if (this.videos && this.videos.length > 0) {
      this.videos.forEach(video => {
        this.mediaItems.push({
          id: video.id,
          url: this.constructVideoUrl(video.videoUrl),
          type: 'video',
          description: video.description,
          isMainImage: false,
          sortOrder: video.sortOrder || 999
        });
      });
    }

    // Sort by sortOrder
    this.mediaItems.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private selectInitialMedia() {
    if (this.mediaItems && this.mediaItems.length > 0) {
      // Select main media first, or first media if no main media
      this.selectedMedia = this.mediaItems.find(media => media.isMainImage) || this.mediaItems[0];
    }
  }

  /**
   * Navigate to next media
   */
  nextMedia() {
    if (!this.mediaItems || this.mediaItems.length <= 1) return;

    const currentIndex = this.getCurrentMediaIndex();
    const nextIndex = (currentIndex + 1) % this.mediaItems.length;
    this.selectedMedia = this.mediaItems[nextIndex];
  }

  /**
   * Navigate to previous media
   */
  previousMedia() {
    if (!this.mediaItems || this.mediaItems.length <= 1) return;

    const currentIndex = this.getCurrentMediaIndex();
    const prevIndex = currentIndex === 0 ? this.mediaItems.length - 1 : currentIndex - 1;
    this.selectedMedia = this.mediaItems[prevIndex];
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent) {
    if (!this.mediaItems || this.mediaItems.length <= 1) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.nextMedia();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousMedia();
        break;
    }
  }

  selectMedia(media: MediaItem) {
    this.selectedMedia = media;
  }

  /**
   * Construct absolute image URL for production or relative URL for development
   */
  private constructImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '/public/no-image.svg';
    }

    // If already absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // In production, always use absolute URLs
    if (environment.production) {
      const baseUrl = 'https://elzahygroupback.premiumasp.net';

      // Handle absolute paths
      if (imageUrl.startsWith('/')) {
        return `${baseUrl}${imageUrl}`;
      }

      // Handle GUID or relative paths
      return `${baseUrl}/api/projects/images/${imageUrl}`;
    }

    // In development, use relative URLs
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    return `/api/projects/images/${imageUrl}`;
  }

  /**
   * Construct absolute video URL for production or relative URL for development
   */
  private constructVideoUrl(videoUrl: string): string {
    if (!videoUrl) return '';

    // If already absolute URL, return as is
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl;
    }

    // In production, always use absolute URLs
    if (environment.production) {
      const baseUrl = 'https://elzahygroupback.premiumasp.net';

      // Handle absolute paths
      if (videoUrl.startsWith('/')) {
        return `${baseUrl}${videoUrl}`;
      }

      // Handle GUID or relative paths
      return `${baseUrl}/api/projects/videos/${videoUrl}`;
    }

    // In development, use relative URLs
    if (videoUrl.startsWith('/')) {
      return videoUrl;
    }

    return `/api/projects/videos/${videoUrl}`;
  }

  getThumbnailClasses(media: MediaItem): string {
    const baseClasses = 'hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500';
    const selectedClasses = this.selectedMedia?.id === media.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300';
    return `${baseClasses} ${selectedClasses}`;
  }

  getCurrentMediaIndex(): number {
    if (!this.selectedMedia) return 0;
    return this.mediaItems.findIndex(media => media.id === this.selectedMedia!.id);
  }

  trackByMediaId(index: number, media: MediaItem): string {
    return media.id;
  }
}
