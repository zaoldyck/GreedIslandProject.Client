// require-authentication.guard.ts
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { AuthenticationService } from './authentication-service';

export const requireAuthenticationGuard: CanActivateFn = (_route, state) => {
  const pid = inject(PLATFORM_ID);
  if (!isPlatformBrowser(pid)) return of(true); // SSR 端直接放行

  const router = inject(Router);
  const auth = inject(AuthenticationService);

  // 关键：守卫返回 Observable，Router 会等待它完成
  return auth.refreshSession().pipe(
    map(isLoggedIn =>
      isLoggedIn
        ? true
        : router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        })
    )
  );
};
