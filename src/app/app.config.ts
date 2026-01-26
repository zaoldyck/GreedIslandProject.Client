// src/app/app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
  provideAppInitializer, isDevMode, // ✅ Angular 19+ / 20 官方推荐
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { firstValueFrom } from 'rxjs'; // ✅ 替代 toPromise()

import { routes } from './app.routes';
import { AuthenticationService } from './core/services/authentication-service';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideNativeDateAdapter(),
    // 应用启动初始化（阻塞启动直到会话探测完成）
    provideAppInitializer(() => {
      const auth = inject(AuthenticationService);
      // 用 firstValueFrom 等待 Observable 解析一次值（不再用 toPromise）
      return firstValueFrom(auth.refreshSession())
        .catch(() => void 0); // 失败时忽略，保证不阻塞到异常
    }),
    provideTransloco({
      config: {
        availableLangs: ['en', 'zh-CN'],
        defaultLang: 'zh-CN',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader
    }),
  ],
};
