import { ApplicationConfig, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
 
import { firstValueFrom } from 'rxjs';
import { AuthenticationService } from './app/core/services/authentication-service';

export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ 新的初始化方式
    makeEnvironmentProviders([
      {
        provide: 'APP_STARTUP',
        useFactory: (authService: AuthenticationService) => {
          return async () => {
            await firstValueFrom(authService.refreshSession()); // 强制刷新会话
          };
        },
        deps: [AuthenticationService]
      }
    ])
  ]
};
