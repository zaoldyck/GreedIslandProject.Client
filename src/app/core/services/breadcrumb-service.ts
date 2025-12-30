import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string; // 最终显示文本
  url: string;   // 可点击的完整路径
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {

  private router = inject(Router);
  private root = inject(ActivatedRoute);

  // 外部组件通过 svc.items() 读取面包屑数组
  readonly items = signal<BreadcrumbItem[]>([]);

  constructor() {
    // 监听每次导航完成后重新构建面包屑
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.build());

    // 首次加载也构建一次
    this.build();
  }

  private build() {
    const list: BreadcrumbItem[] = [];
    let route: ActivatedRoute | null = this.root;
    let url = '';

    while (route) {
      const snapshot = route.snapshot;

      // 只处理主出口，跳过 aux 路由
      if (snapshot.outlet && snapshot.outlet !== 'primary') {
        route = route.firstChild ?? null;
        continue;
      }

      // 从 data 中取出 breadcrumb 定义
      const bcDef = snapshot.data?.['breadcrumb'];
      // 如果有 resolver 写入 title，则优先使用
      const titleFromResolver = snapshot.data?.['title'];

      // 拼接当前层级的 URL 片段
      if (snapshot.url.length) {
        url += '/' + snapshot.url.map(s => s.path).join('/');
      }

      // 跳过隐藏层（null/undefined）
      if (bcDef === null || bcDef === undefined) {
        route = route.firstChild ?? null;
        continue;
      }

      // 支持函数型定义：(snap)=>string
      const label = typeof bcDef === 'function'
        ? (bcDef as (snap: ActivatedRouteSnapshot) => string)(snapshot)
        : (titleFromResolver ?? bcDef);

      list.push({ label: String(label), url });

      // 进入下一层
      route = route.firstChild ?? null;
    }

    this.items.set(list);
  }
}
