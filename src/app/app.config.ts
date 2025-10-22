// src/app/app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// ✅ 关键：注册 HttpClient（可按需启用 fetch / 拦截器等）
import {
  provideHttpClient,
  // withFetch,                 // 可选：改用 Fetch API
  // withInterceptors,          // 可选：函数式拦截器
  // withInterceptorsFromDi,    // 可选：沿用 class 拦截器（DI 方式）
  // withRequestsMadeViaParent, // 可选：将请求委托给父注入器
} from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // ✅ HttpClient 在此注册
    provideHttpClient(),
    // 如果你更倾向于 Fetch，可改为：
    // provideHttpClient(withFetch()),
  ],
};
