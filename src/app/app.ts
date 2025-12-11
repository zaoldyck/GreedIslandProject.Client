import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './core/toast/components/toast/toast';
import { CommonService } from './core/services/common-service';
import { ProgressBar } from './layouts/progress-bar/progress-bar';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ProgressBar, RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly title = signal('greedislandproject.client');
  private commonService = inject(CommonService);

  ngOnInit() {
    // ✅ 匿名用户兜底加载省份（已登录用户不会重复请求，因为有缓存）
    this.commonService.getPreferredProvinceId().subscribe({
      next: () => { },
      error: () => { } // 可以忽略错误或做简单日志
    });
  }
}
