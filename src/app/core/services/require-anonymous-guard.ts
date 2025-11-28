// require-anonymous.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './authentication-service';

// 匿名守卫：已登录访问 login/register → 跳到根（最后会被重定向到主页）
export const requireAnonymousGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthenticationService);

  // 直接走 CSR 判断
  return auth.isLoggedIn() ? router.createUrlTree(['/']) : true;
};
