import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProjectsSectionComponent } from '../../components/projects-section/projects-section.component';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [SharedModule, PageWrapperComponent, ProjectsSectionComponent],
  templateUrl: './projects-page.component.html'
})
export class ProjectsPageComponent {}
