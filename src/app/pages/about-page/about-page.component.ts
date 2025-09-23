import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [SharedModule, AboutSectionComponent],
  templateUrl: './about-page.component.html'
})
export class AboutPageComponent {}
