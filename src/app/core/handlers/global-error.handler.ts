import { Injectable, ErrorHandler } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error caught:', error);

    // In a real application, you might want to:
    // 1. Send error to logging service
    // 2. Show user-friendly error message
    // 3. Track error analytics

    // For now, just log to console
    if (error.message) {
      console.error('Error message:', error.message);
    }

    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}
