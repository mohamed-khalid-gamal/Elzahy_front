import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { ProjectsSectionComponent } from '../../components/projects-section/projects-section.component';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';
import { AwardsSectionComponent } from '../../components/awards-section/awards-section.component';
import { SeoService } from '../../services/seo.service';
import { MetaService } from '../../core/services/meta.service';
import { SEO_CONSTANTS } from '../../constants/seo.constants';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule, SharedModule, TranslateModule, PageWrapperComponent, HeroSectionComponent, ProjectsSectionComponent, AboutSectionComponent, AwardsSectionComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit {
  private seoService = inject(SeoService);
  private metaService = inject(MetaService);

  ngOnInit() {
    // Set home page specific SEO
    this.seoService.updateSEO({
      ...SEO_CONSTANTS.PAGES.HOME,
      url: SEO_CONSTANTS.BASE_URL
    });

    // Update meta tags with translations
    this.metaService.updateHomeMeta();
  }
}
