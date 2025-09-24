import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth-functional.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      timeOut: 3000,
      closeButton: true,
    }),
  ],
}).then(() => {
  // Remove/Hide splash loader after bootstrap
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('loaded');
    setTimeout(() => loader.remove(), 2000); // allow transition
  }
}).catch((err: unknown) => console.error(err));
