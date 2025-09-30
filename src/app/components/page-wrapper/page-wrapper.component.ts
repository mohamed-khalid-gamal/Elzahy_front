import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page-wrapper',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './page-wrapper.component.html',
})
export class PageWrapperComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() titleKey?: string;
  @Input() descriptionKey?: string;
}
