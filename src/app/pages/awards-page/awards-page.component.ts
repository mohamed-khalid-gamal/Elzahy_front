import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AwardsSectionComponent } from '../../components/awards-section/awards-section.component';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';

@Component({
  selector: 'app-awards-page',
  standalone: true,
  imports: [SharedModule, PageWrapperComponent, AwardsSectionComponent],
  templateUrl: './awards-page.component.html'
})
export class AwardsPageComponent {}
