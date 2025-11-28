// core/services/require-authentication-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './authentication-service';

// 受保护守卫：不请求网络，只根据当前信号
export const requireAuthenticationGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthenticationService);

  if (auth.isKnown()) {
    return auth.isLoggedIn()
      ? true
      : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // 未探测（unknown）时的保守策略：先去登录
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
