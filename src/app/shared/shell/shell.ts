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
  styleUrls: ['./shell.scss'], // 注意这里用 styleUrls（数组），而不是 styleUrl
  imports: [
    // Router（若本组件里使用 <router-outlet> 就保留 RouterOutlet，否则可移除）
    RouterLinkActive, RouterLink, RouterOutlet,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatSidenavModule,                // ★ 必须：提供 <mat-sidenav-container>/<mat-sidenav>/<mat-sidenav-content>
    MatListModule,                   // 菜单列表（<mat-nav-list>/<a mat-list-item>）
    MatDividerModule,
  ],
})
export class Shell implements AfterViewInit {
  public authenticationService = inject(AuthenticationService);
  public commonService = inject(CommonService);
  public router = inject(Router);
  private destroyRef = inject(DestroyRef);
  @ViewChild('content', { read: ElementRef }) private contentEl?: ElementRef<HTMLElement>;



  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        const isBrowser = typeof window !== 'undefined';
        if (isBrowser) {
          this.commonService.scrollToTop('auto'); // ✅ 统一入口
        }
      });
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
