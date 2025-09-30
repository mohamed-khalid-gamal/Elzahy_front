import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestTranslationService {
  constructor(private http: HttpClient) {}

  testTranslationFiles(): void {
    console.log('🧪 Testing translation file access...');

    // Test English file
    this.http.get('assets/i18n/en.json').subscribe({
      next: (data) => {
        console.log('✅ English translation file loaded successfully:', data);
      },
      error: (error) => {
        console.error('❌ Failed to load English translation file:', error);
      }
    });

    // Test Arabic file
    this.http.get('assets/i18n/ar.json').subscribe({
      next: (data) => {
        console.log('✅ Arabic translation file loaded successfully:', data);
      },
      error: (error) => {
        console.error('❌ Failed to load Arabic translation file:', error);
      }
    });
  }
}
