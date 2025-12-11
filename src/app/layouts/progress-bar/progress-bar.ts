
// src/app/layout/components/progress-bar/progress-bar.ts
import { isPlatformServer } from '@angular/common';
import {
  Component,
  inject,
  PLATFORM_ID,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';   // ✅ 正确导入
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  NavigationSkipped,
} from '@angular/router';
import { NgProgressbar, NgProgressRef } from 'ngx-progressbar';
import { filter, take } from 'rxjs';
import { CommonService } from '../../core/services/common-service';

export const PROGRESS_BAR_DELAY = 30;

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [NgProgressbar],
  templateUrl: './progress-bar.html',
  styleUrls: ['./progress-bar.scss'],
})
export class ProgressBar {
  private readonly router = inject(Router);
  private readonly loading = inject(CommonService);
  readonly progressBar = viewChild.required(NgProgressRef);
  isServer = isPlatformServer(inject(PLATFORM_ID));

  /** ✅ 在“字段初始化”里把 signal 转成 Observable（这是注入上下文） */
  private readonly show$ = toObservable(this.loading.showGlobal);

  constructor() {
    this.setupNavigationState();

    /** ✅ 在下一次渲染后再订阅（此时 viewChild 已可用） */
    afterNextRender(() => {
      if (this.isServer) return;
      this.show$.subscribe((show) => {
        if (show) this.progressBar().start();
        else this.progressBar().complete();
      });
    });
  }

  /** 仅设置路由状态，进度条由 show$ 统一控制 */
  private setupNavigationState() {
    if (this.isServer) return;

    let delayTimer: any = null;

    this.router.events.pipe(filter(e => e instanceof NavigationStart))
      .subscribe(() => {
        delayTimer = setTimeout(() => this.loading.setNavigating(true), PROGRESS_BAR_DELAY);
      });

    this.router.events.pipe(
      filter(e =>
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationSkipped ||
        e instanceof NavigationError
      ),
      take(1)
    ).subscribe(() => {
      clearTimeout(delayTimer);
      this.loading.setNavigating(false);
    });
  }
}
