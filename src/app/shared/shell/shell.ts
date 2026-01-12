
import { AfterViewInit, Component, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet, UrlTree } from '@angular/router';
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
import { Constants } from '../../core/constants/constants';
import { LureCommunityNavItem } from '../../core/models/lure/lure-community-models';

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
    readonly constants = inject(Constants);
  public authenticationService = inject(AuthenticationService);
  public commonService = inject(CommonService);
  public router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);           // ✅ 新增：注入 ActivatedRoute

  @ViewChild('content', { read: ElementRef })
  private contentEl?: ElementRef<HTMLElement>;

  // 快速链接折叠状态：默认展开（false 表示未折叠）
  readonly quickLinksCollapsed = signal<boolean>(false);
  // 快速链接折叠状态：默认展开（false 表示未折叠）
  readonly tagsCollapsed = signal<boolean>(false);
  // 若当前 URL 属于 “更多” 集合，则持有该项；否则 undefined
  readonly currentMoreItem = signal<LureCommunityNavItem | undefined>(undefined);
 
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
    if (this.menuType == 'community') {
      this.updateCurrentMoreItem();
    }
    drawer.open();
  }
  toggleQuickLinks(): void {
    this.quickLinksCollapsed.update(v => !v);
  }
  toggleTags(): void {
    this.tagsCollapsed.update(v => !v);
  }
  private updateCurrentMoreItem(): void {
    const tree: UrlTree = this.router.parseUrl(this.router.url);

    // 仅取 primary 出口的路径（不含搜索串）
    const primary = tree.root.children['primary'];
    const path = '/' + (primary?.segments.map(s => s.path).join('/') ?? '');

    // 当前搜索参数（如果你后面需要“半放宽”可以用到）
    const qp = tree.queryParams ?? {};

    // 放宽匹配规则：
    // 1) 路径 startsWith（支持 /lure/community/users?... 任意搜索参数）
    // 2) 不强制匹配 queryParams（完全忽略）；如需“半放宽”，见下方注释
    const match = this.constants.lureCommunityMoreNav.find(item => {
      // 允许 link 为 '/lure/community/users' 匹配 '/lure/community/users?order=xxx'
      const pathMatch = path.startsWith(item.link);
      if (!pathMatch) return false;

      // ----（可选）半放宽：如果你仍希望对声明的 queryParams 做基本一致性校验——
      // 仅当当前 URL 中包含该键时才校验值，否则不校验。
      // if (item.queryParams) {
      //   const ok = Object.entries(item.queryParams)
      //     .every(([k, v]) => (k in qp) ? qp[k] === v : true);
      //   if (!ok) return false;
      // }

      return true;
    });

    this.currentMoreItem.set(match ?? undefined);
  }
}
