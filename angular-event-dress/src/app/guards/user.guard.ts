import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(UserService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    alert('יש להתחבר כדי לגשת לדף זה');
    router.navigate(['/login']);
    return false;
  }

  return true;
};
