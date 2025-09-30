import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Compress a single image file
   */
  async compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    if (!isPlatformBrowser(this.platformId)) {
      return file;
    }

    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      maxSizeKB = 500,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // Draw and compress the image
          ctx!.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if compressed size meets requirements
            const sizeKB = blob.size / 1024;
            if (sizeKB <= maxSizeKB) {
              // Create new file with compressed data
              const compressedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              // If still too large, try with lower quality
              const lowerQuality = Math.max(0.3, quality - 0.2);
              this.compressImage(file, { ...options, quality: lowerQuality })
                .then(resolve)
                .catch(reject);
            }
          }, `image/${format}`, quality);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Compress multiple images concurrently with progress tracking
   */
  async compressImages(
    files: FileList | File[],
    options: CompressionOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<File[]> {
    const fileArray = Array.from(files);
    const compressedFiles: File[] = [];
    let completed = 0;

    const promises = fileArray.map(async (file) => {
      try {
        const compressed = await this.compressImage(file, options);
        compressedFiles.push(compressed);
        completed++;
        if (onProgress) {
          onProgress((completed / fileArray.length) * 100);
        }
        return compressed;
      } catch (error) {
        console.error(`Failed to compress ${file.name}:`, error);
        // Return original file if compression fails
        completed++;
        if (onProgress) {
          onProgress((completed / fileArray.length) * 100);
        }
        return file;
      }
    });

    return Promise.all(promises);
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if necessary
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Get file size in KB
   */
  getFileSizeKB(file: File): number {
    return Math.round(file.size / 1024);
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File, maxSizeKB: number = 10240): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size
    const sizeKB = this.getFileSizeKB(file);
    if (sizeKB > maxSizeKB) {
      return { valid: false, error: `Image must be smaller than ${maxSizeKB}KB` };
    }

    return { valid: true };
  }

  /**
   * Create image preview URL
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Clean up preview URL
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}
