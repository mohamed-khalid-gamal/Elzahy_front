import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 't',
  standalone: true,
  pure: false
})
export class TranslateInstantPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(key: string, params?: Record<string, any>, fallback?: string): string {
    if (!key) return '';
    const value = this.translate.instant(key, params);
    return value === key ? (fallback ?? key) : value;
  }
}
