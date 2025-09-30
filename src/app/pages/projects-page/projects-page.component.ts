import { Component, OnInit, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProjectsSectionComponent } from '../../components/projects-section/projects-section.component';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [SharedModule, PageWrapperComponent, ProjectsSectionComponent],
  templateUrl: './projects-page.component.html'
})
export class ProjectsPageComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit() {
    // Rely on SeoService route-based SEO or meta.translations
    this.seoService.updateSEO({
      // Keep URL only; title/description come from meta translations used in PageWrapper
      url: 'https://elzahygroup.com/projects'
    });
  }
}
