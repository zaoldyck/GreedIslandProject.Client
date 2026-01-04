import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
 
@Component({
  selector: 'app-lure-community-home',
  imports: [MatIconModule, MatSidenavModule],
  templateUrl: './lure-community-home.html',
  styleUrl: './lure-community-home.scss',
})
export class LureCommunityHome implements OnInit {
  private destroyRef = inject(DestroyRef);

  // 响应式状态（不用 CDK）
  isHandset = window.matchMedia('(max-width: 959px)').matches;

  drawerMode: 'side' | 'over' = this.isHandset ? 'over' : 'side';
  drawerOpened = !this.isHandset; // 手机默认关闭，桌面默认打开

  ngOnInit(): void {
    const mq = window.matchMedia('(max-width: 959px)');
    const handler = (e: MediaQueryListEvent) => {
      this.isHandset = e.matches;
      this.drawerMode = this.isHandset ? 'over' : 'side';
      this.drawerOpened = !this.isHandset;
    };

    // 监听断点变化
    mq.addEventListener('change', handler);

    // 清理（Angular 21 可用 DestroyRef）
    this.destroyRef.onDestroy(() => {
      mq.removeEventListener('change', handler);
    });
  }

  // 其它业务...
}
