import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError, switchMap } from 'rxjs/operators';

export interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    delay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000
  };

  /**
   * Retry an observable with exponential backoff
   */
  retryWithBackoff<T>(
    source: Observable<T>,
    config: Partial<RetryConfig> = {}
  ): Observable<T> {
    const finalConfig = { ...this.defaultRetryConfig, ...config };

    return source.pipe(
      retry({
        count: finalConfig.maxRetries,
        delay: (error, retryCount) => {
          const delay = Math.min(
            finalConfig.delay * Math.pow(finalConfig.backoffMultiplier, retryCount - 1),
            finalConfig.maxDelay
          );

          console.log(
            `Retrying operation (attempt ${retryCount}/${finalConfig.maxRetries}) after ${delay}ms delay`,
            error
          );

          return timer(delay);
        }
      }),
      catchError(error => {
        console.error(`Operation failed after ${finalConfig.maxRetries} retries:`, error);
        return throwError(() => this.createUserFriendlyError(error));
      })
    );
  }

  /**
   * Create user-friendly error messages
   */
  private createUserFriendlyError(error: any): Error {
    if (error?.status === 0) {
      return new Error('Network connection failed. Please check your internet connection.');
    }

    if (error?.status >= 400 && error?.status < 500) {
      return new Error('Invalid request. Please check your input and try again.');
    }

    if (error?.status >= 500) {
      return new Error('Server error. Please try again later.');
    }

    if (error?.message?.includes('timeout')) {
      return new Error('Request timed out. Please try again.');
    }

    return new Error(error?.message || 'An unexpected error occurred.');
  }

  /**
   * Handle image loading errors with fallback strategies
   */
  handleImageError(imageElement: HTMLImageElement, fallbackUrls: string[]): void {
    const currentSrc = imageElement.src;
    const currentIndex = fallbackUrls.indexOf(currentSrc);
    const nextIndex = currentIndex + 1;

    if (nextIndex < fallbackUrls.length) {
      console.log(`Trying fallback image ${nextIndex + 1}/${fallbackUrls.length}`);
      imageElement.src = fallbackUrls[nextIndex];
    } else {
      console.warn('All image fallbacks failed, using default placeholder');
      imageElement.src = '/no-image.svg';
      imageElement.classList.add('error-placeholder');
    }
  }

  /**
   * Log error with context information
   */
  logError(error: any, context: string, additionalInfo?: any): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error?.message,
        stack: error?.stack,
        status: error?.status,
        statusText: error?.statusText,
        url: error?.url
      },
      additionalInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Application Error:', errorInfo);

    // You could send this to a logging service
    // this.sendToLoggingService(errorInfo);
  }
}
