
import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private router = inject(Router);
  // ⚠️ 删除对 ActivatedRoute 的直接注入
  // private root = inject(ActivatedRoute);

  readonly items = signal<BreadcrumbItem[]>([]);

  constructor() {
    // 等待导航完成再构建
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.build());

    // 如果应用已完成首个导航，这里也可以构建一次，
    // 否则首次构建依赖于上面的 NavigationEnd
    this.build();
  }

  private build() {
    const list: BreadcrumbItem[] = [];

    // 用 RouterState 的根作为起点
    let route: ActivatedRoute | null = this.router.routerState.root;
    let url = '';

    while (route) {
      const snapshot: ActivatedRouteSnapshot | null = (route as any)?.snapshot ?? null;

      // 如果当前节点还没有快照（初始化/懒加载边界），跳到子节点
      if (!snapshot) {
        route = route.firstChild ?? null;
        continue;
      }

      // 只处理主出口，跳过 aux 路由
      const outlet = snapshot.outlet ?? 'primary';
      if (outlet !== 'primary') {
        route = route.firstChild ?? null;
        continue;
      }

      // 当前层级的 URL 片段
      if (snapshot.url?.length) {
        // snapshot.url 是 UrlSegment[]，拼接 path
        url += '/' + snapshot.url.map(s => s.path).join('/');
      }

      // 从 data 中取 breadcrumb 定义
      const bcDef = snapshot.data?.['breadcrumb'];
      const titleFromResolver = snapshot.data?.['title'];

      // 跳过隐藏层（null/undefined）
      if (bcDef === null || bcDef === undefined) {
        route = route.firstChild ?? null;
        continue;
      }

      const label =
        typeof bcDef === 'function'
          ? (bcDef as (snap: ActivatedRouteSnapshot) => string)(snapshot)
          : (titleFromResolver ?? bcDef);

      list.push({ label: String(label), url });

      // 进入下一层
      route = route.firstChild ?? null;
    }

    this.items.set(list);
  }
}
