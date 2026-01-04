
import { AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthenticationService } from '../../core/services/authentication-service';

// Angular Material（standalone）
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CommonService } from '../../core/services/common-service';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss'],
  imports: [
    RouterLinkActive, RouterLink, RouterOutlet,
    MatMenuModule, MatIconModule, MatTooltipModule,
    MatButtonModule, MatSidenavModule, MatListModule, MatDividerModule,
  ],
})
export class Shell implements AfterViewInit {
  public authenticationService = inject(AuthenticationService);
  public commonService = inject(CommonService);
  public router = inject(Router);
  private destroyRef = inject(DestroyRef);

  @ViewChild('content', { read: ElementRef }) private contentEl?: ElementRef<HTMLElement>;

  /** ✅ 新增：是否加宽页面（交流区） */
  isWide = false;

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe((e: NavigationEnd) => {
        // 原有：导航后滚动复位
        const isBrowser = typeof window !== 'undefined';
        if (isBrowser) {
          this.commonService.scrollToTop('auto');
        }
        // 新增：根据当前 URL 计算是否加宽
        const url = e.urlAfterRedirects ?? e.url ?? '';
        this.isWide = this.isWideUrl(url);
      });

    // 首次进入也计算一次（避免首次渲染未触发 NavigationEnd）
    this.isWide = this.isWideUrl(this.router.url);
  }

  /** 仅在 /lure/community 以及其子路由下加宽 */
  private isWideUrl(url: string): boolean {
    const clean = (url || '').split('?')[0].split('#')[0];
    return clean.startsWith('/lure/community');
    // 如果你只想首页加宽、详情页不加宽，把上面改成：
    // return clean === '/lure/community';
  }

  ngAfterViewInit() {
    const el = this.contentEl?.nativeElement;
    if (el) {
      this.commonService.registerScrollHost(el);
    }
  }

  logout() {
    this.authenticationService.logout().subscribe({
      next: () => this.router.navigateByUrl('/'),
    });
  }

  getInitials(name?: string | null): string {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  }
}
