import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';

import { map } from 'rxjs/operators';
import { AuthenticationService } from './authentication-service';
import { isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';

export const requireAuthenticationGuard: CanActivateFn = (_route, state) => {
  const pid = inject(PLATFORM_ID);
  if (!isPlatformBrowser(pid)) return of(true);

  const router = inject(Router);
  const authentication = inject(AuthenticationService);

  return authentication.checkSession().pipe(
    map(ok => ok ? true : router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    })) // "未登录时跳转到登录页，并带上returnUrl"
  );
};
