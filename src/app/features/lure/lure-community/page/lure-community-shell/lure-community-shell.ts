
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd, UrlTree } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { filter } from 'rxjs/operators';

import { Constants } from '../../../../../core/constants/constants';
import { LureCommunityNavItem } from '../../../../../core/models/lure/lure-community-models';
 
@Component({
  selector: 'app-lure-community-shell',
  imports: [MatMenuModule, MatButtonModule, MatListModule, RouterLinkActive, RouterLink, MatIconModule, MatSidenavModule, RouterOutlet],
  templateUrl: './lure-community-shell.html',
  styleUrl: './lure-community-shell.scss',  
})
export class LureCommunityShell implements OnInit {
  readonly constants = inject(Constants);
  readonly collapsed = signal<boolean>(false);


  // 若当前 URL 属于 “更多” 集合，则持有该项；否则 undefined
  readonly currentMoreItem = signal<LureCommunityNavItem | undefined>(undefined);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // 首次进入也计算一次
    this.updateCurrentMoreItem();

    // 监听导航结束事件进行更新
    const sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateCurrentMoreItem());

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  onExpand(): void { this.collapsed.set(false); }
  onCollapse(): void { this.collapsed.set(true); }


  private updateCurrentMoreItem(): void {
    const tree: UrlTree = this.router.parseUrl(this.router.url);

    // 仅取 primary 出口的路径（不含查询串）
    const primary = tree.root.children['primary'];
    const path = '/' + (primary?.segments.map(s => s.path).join('/') ?? '');

    // 当前查询参数（如果你后面需要“半放宽”可以用到）
    const qp = tree.queryParams ?? {};

    // 放宽匹配规则：
    // 1) 路径 startsWith（支持 /lure/community/users?... 任意查询参数）
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
