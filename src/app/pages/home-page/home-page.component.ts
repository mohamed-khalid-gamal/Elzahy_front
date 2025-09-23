import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { ProjectsSectionComponent } from '../../components/projects-section/projects-section.component';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';
import { AwardsSectionComponent } from '../../components/awards-section/awards-section.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule, SharedModule, PageWrapperComponent, HeroSectionComponent, ProjectsSectionComponent, AboutSectionComponent, AwardsSectionComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {}
