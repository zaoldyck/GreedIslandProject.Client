
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';

import { TagTypeViewModel } from '../view-models/tag-type-view-model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommonService {
  private http = inject(HttpClient);
  private base = '/api';

  // =========================
  // 全局进度条/加载状态管理
  // =========================

  /** 业务手动 loading 计数（并发安全） */
  private manualCount = signal(0);

  /** HTTP in-flight 计数（可用拦截器维护） */
  private httpCount = signal(0);

  /** 路由导航状态（你的进度条逻辑可写入/清除） */
  private navigating = signal(false);

  /** 是否需要显示全局进度条（任一来源为真） */
  readonly showGlobal = computed(() =>
    this.navigating() || this.httpCount() > 0 || this.manualCount() > 0
  );

  // —— 业务代码使用 —— //
  beginLoading() { this.manualCount.set(this.manualCount() + 1); }
  endLoading() { this.manualCount.set(Math.max(0, this.manualCount() - 1)); }

  /** 包装任意 Promise：自动 begin/end */
  async runWithLoading<T>(work: Promise<T>): Promise<T> {
    this.beginLoading();
    try { return await work; }
    finally { this.endLoading(); }
  }

  // —— 供 HTTP 拦截器使用（可选） —— //
  incHttp() { this.httpCount.set(this.httpCount() + 1); }
  decHttp() { this.httpCount.set(Math.max(0, this.httpCount() - 1)); }

  // —— 供路由监听使用（你已有） —— //
  setNavigating(on: boolean) { this.navigating.set(on); }

  // =========================
  // 业务 API
  // =========================

  getTagTypes(tagTypeCodes: string[]): Observable<TagTypeViewModel[]> {
    return this.http.post<TagTypeViewModel[]>(`${this.base}/common/tagtypes`, tagTypeCodes);
  }

  // =========================
  // 滚动容器管理（新增）
  // =========================

  /** mat-sidenav-content 的宿主元素 */
  private scrollHost?: HTMLElement;

  /**
   * 在布局组件 (含 mat-sidenav-content 的那层) 调用一次，注册滚动容器。
   * @example
   * // layout.component.ts (ngAfterViewInit)
   * this.commonService.registerScrollHost(this.contentEl.nativeElement);
   */
  registerScrollHost(el: HTMLElement) {
    this.scrollHost = el;
  }

  /** 滚动到顶部（容器，不是 window） */
  scrollToTop(behavior: ScrollBehavior = 'auto') {
    this.scrollHost?.scrollTo({ top: 0, left: 0, behavior });
  }

  /** 滚动到指定 offset */
  scrollTo(offset: number, behavior: ScrollBehavior = 'auto') {
    this.scrollHost?.scrollTo({ top: offset, left: 0, behavior });
  }

  /**
   * 滚动到容器内的某个元素。
   * @param target 选择器或元素
   */
  scrollIntoView(target: string | HTMLElement, behavior: ScrollBehavior = 'smooth') {
    const el = typeof target === 'string'
      ? (this.scrollHost?.querySelector(target) as HTMLElement | null)
      : target;
    el?.scrollIntoView({ behavior, block: 'start' });
  }

  /** 当前滚动位置（可用于记录/恢复） */
  currentScrollTop(): number {
    return this.scrollHost?.scrollTop ?? 0;
  }
}
