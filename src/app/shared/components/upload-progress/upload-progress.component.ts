import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" *ngIf="show">
      <div class="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 border border-gray-700">
        <div class="text-center mb-4">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-full mb-3">
            <svg class="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
          <p class="text-gray-400 text-sm mt-1">{{ message }}</p>
        </div>

        <div class="space-y-3">
          <!-- Overall Progress -->
          <div>
            <div class="flex justify-between text-sm text-gray-300 mb-1">
              <span>Overall Progress</span>
              <span>{{ progress.toFixed(0) }}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                [style.width.%]="progress"
              ></div>
            </div>
          </div>

          <!-- File Progress (if applicable) -->
          <div *ngIf="fileProgress && fileProgress.length > 0">
            <div class="text-sm text-gray-400 mb-2">Processing Files:</div>
            <div class="space-y-1 max-h-24 overflow-y-auto">
              <div
                *ngFor="let file of fileProgress; trackBy: trackByIndex"
                class="flex items-center justify-between text-xs text-gray-400"
              >
                <span class="truncate mr-2">{{ file.name }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-8 bg-gray-700 rounded-full h-1">
                    <div
                      class="bg-green-500 h-1 rounded-full transition-all duration-200"
                      [style.width.%]="file.progress"
                    ></div>
                  </div>
                  <span class="w-8 text-right">{{ file.progress.toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div *ngIf="stats" class="pt-2 border-t border-gray-700">
            <div class="grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div *ngIf="stats.timeElapsed">
                <div class="text-gray-500">Time Elapsed</div>
                <div class="text-white">{{ formatTime(stats.timeElapsed) }}</div>
              </div>
              <div *ngIf="stats.timeRemaining">
                <div class="text-gray-500">Time Remaining</div>
                <div class="text-white">{{ formatTime(stats.timeRemaining) }}</div>
              </div>
              <div *ngIf="stats.speed">
                <div class="text-gray-500">Upload Speed</div>
                <div class="text-white">{{ stats.speed }}</div>
              </div>
              <div *ngIf="stats.processedSize && stats.totalSize">
                <div class="text-gray-500">Data Processed</div>
                <div class="text-white">{{ stats.processedSize }} / {{ stats.totalSize }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancel Button -->
        <div class="mt-4 flex justify-center" *ngIf="canCancel">
          <button
            (click)="onCancel()"
            class="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `
})
export class UploadProgressComponent {
  @Input() show = false;
  @Input() title = 'Processing';
  @Input() message = 'Please wait...';
  @Input() progress = 0;
  @Input() canCancel = false;
  @Input() fileProgress: { name: string; progress: number }[] = [];
  @Input() stats: {
    timeElapsed?: number;
    timeRemaining?: number;
    speed?: string;
    processedSize?: string;
    totalSize?: string;
  } | null = null;

  onCancel() {
    // Emit cancel event or handle cancellation
    console.log('Upload cancelled by user');
  }

  trackByIndex(index: number): number {
    return index;
  }

  formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }
}
