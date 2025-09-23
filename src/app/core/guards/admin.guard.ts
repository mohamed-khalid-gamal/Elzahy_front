import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const adminGuard = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isAuthenticated() && tokenService.isAdmin()) {
    return true;
  }

  if (tokenService.isAuthenticated()) {
    router.navigate(['/unauthorized']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
