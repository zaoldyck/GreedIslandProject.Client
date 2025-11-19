// require-authentication.guard.ts
import { inject, PLATFORM_ID } from '@angular/core'; // ← 加上 REQUEST
import { CanActivateFn, Router } from '@angular/router';
import { map,  take, tap } from 'rxjs';
import { AuthenticationService } from './authentication-service';

export const requireAuthenticationGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthenticationService);

  // 平台 & SSR 请求对象（仅在 SSR 渲染时有值；CSR/SSG 为 null）
  const pid = inject(PLATFORM_ID);
 
  // 浏览器分支
  return auth.refreshSession().pipe(
    tap(v => {
      if (process.env['NODE_ENV'] !== 'production') {
        console.log('[Guard][CSR] refreshSession first =', v, '| path:', state.url);
      }
    }),
    take(1),
    map(isLoggedIn =>
      isLoggedIn
        ? true
        : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
    )
  );
};
