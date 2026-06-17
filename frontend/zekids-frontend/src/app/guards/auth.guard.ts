import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Admin rotaları için kontrol
  if (state.url.startsWith('/admin')) {
    if (!authService.isAdmin()) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
