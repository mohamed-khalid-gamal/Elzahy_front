import { Component, OnInit, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';
import { SeoService } from '../../services/seo.service';
import { SEO_CONSTANTS } from '../../constants/seo.constants';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [SharedModule, AboutSectionComponent, PageWrapperComponent],
  templateUrl: './about-page.component.html'
})
export class AboutPageComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.updateSEO({
      ...SEO_CONSTANTS.PAGES.ABOUT,
      url: `${SEO_CONSTANTS.BASE_URL}/about`
    });
  }
}
