import { CanActivateFn } from '@angular/router';

export const requireAuthenticationGuard: CanActivateFn = (route, state) => {
  return true;
};
