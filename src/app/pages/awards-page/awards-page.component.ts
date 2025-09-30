import { Component, OnInit, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AwardsSectionComponent } from '../../components/awards-section/awards-section.component';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-awards-page',
  standalone: true,
  imports: [SharedModule, PageWrapperComponent, AwardsSectionComponent],
  templateUrl: './awards-page.component.html'
})
export class AwardsPageComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Awards & Recognition - ELZAHY GROUP Achievements',
      description: 'Discover the awards and recognition ELZAHY GROUP has received for excellence in construction and engineering. Our commitment to quality and innovation has been recognized by industry leaders.',
      keywords: 'construction awards, engineering recognition, industry awards, ELZAHY GROUP achievements, excellence awards',
      url: 'https://elzahygroup.com/awards'
    });
  }
}
