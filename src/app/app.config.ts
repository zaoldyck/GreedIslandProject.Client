
// src/app/app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
  provideAppInitializer,
  isDevMode,
  LOCALE_ID,
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { AuthenticationService } from './core/services/authentication-service';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';

import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),

    // ✅ Material Datepicker 使用 NativeDateAdapter
    provideNativeDateAdapter(),

    // ✅ 让 Material Datepicker（面板文字/星期/月）变中文
    { provide: MAT_DATE_LOCALE, useValue: 'zh-CN' },

    // ✅（可选）让 Angular 的 DatePipe/DecimalPipe 等默认用中文
    { provide: LOCALE_ID, useValue: 'zh-CN' },

    provideAppInitializer(() => {
      const auth = inject(AuthenticationService);
      return firstValueFrom(auth.refreshSession()).catch(() => void 0);
    }),

    provideTransloco({
      config: {
        availableLangs: ['en', 'zh-CN'],
        defaultLang: 'zh-CN',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader
    }),
  ],
};
