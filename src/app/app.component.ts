import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { NavigationComponent } from './components/navigation/navigation.component';
import { AppBackgroundComponent } from './components/app-background/app-background.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScrollService } from './services/scroll.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, SharedModule, NavigationComponent, AppBackgroundComponent, FooterComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'project-angular';

  // Inject the scroll service to initialize scroll behavior
  private scrollService = inject(ScrollService);
}
