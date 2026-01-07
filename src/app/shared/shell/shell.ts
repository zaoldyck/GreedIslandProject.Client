
import { AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Footer } from '../footer/footer';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthenticationService } from '../../core/services/authentication-service';
import { CommonService } from '../../core/services/common-service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

type MenuType = 'main' | 'community';

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss'],
  imports: [Footer,
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
  private route = inject(ActivatedRoute);           // ✅ 新增：注入 ActivatedRoute

  @ViewChild('content', { read: ElementRef })
  private contentEl?: ElementRef<HTMLElement>;

 

  /** ✅ 新增：是否显示“交流区菜单”按钮（由路由 data 决定） */
  showCommunityMenuButton = false;
  menuType: MenuType = 'main';
  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe((e: NavigationEnd) => {
        // 1) 原有：导航后滚动复位
        if (typeof window !== 'undefined') {
          this.commonService.scrollToTop('auto');
        }

 
        // 3) ✅ 由路由 data 决定是否显示按钮
        this.showCommunityMenuButton = this.calculateShowCommunityButton();
      });
 
    this.showCommunityMenuButton = this.calculateShowCommunityButton();
  }
 

  /** ✅ 回溯当前激活路由链，查找 data.showCommunityMenuButton */
  private calculateShowCommunityButton(): boolean {
    // 走到当前“最深”的激活路由
    let r: ActivatedRoute | null = this.route;
    while (r?.firstChild) r = r.firstChild;

    // 从最深层开始，向上回溯到根，查找 data.showCommunityMenuButton
    let p: ActivatedRoute | null = r;
    while (p) {
      if (p.snapshot?.data?.['showCommunityMenuButton']) return true;
      p = p.parent ?? null;
    }
    return false;
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

  openMenu(drawer: { open: () => void }, type: MenuType) {
    this.menuType = type;
    drawer.open();
  }

}
