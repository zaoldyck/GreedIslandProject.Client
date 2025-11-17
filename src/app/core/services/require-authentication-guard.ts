import { isPlatformBrowser } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { of } from "rxjs";
import { AuthenticationService } from "./authentication-service";

export const requireAuthenticationGuard: CanActivateFn = (_route, state) => {
  const pid = inject(PLATFORM_ID);
  if (!isPlatformBrowser(pid)) return of(true);

  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);
  // 直接检查 signal 状态
  const isLoggedIn = authenticationService.isLoggedIn();
  debugger
  return of(isLoggedIn ? true : router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  }));
};
