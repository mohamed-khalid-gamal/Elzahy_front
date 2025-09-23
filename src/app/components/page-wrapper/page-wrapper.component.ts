import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-wrapper.component.html',
})
export class PageWrapperComponent {
  @Input() title?: string;
  @Input() description?: string;
}
