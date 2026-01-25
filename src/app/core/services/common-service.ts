
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';

import { TagTypeViewModel } from '../view-models/tag-type-view-model';
import { Observable } from 'rxjs';
import { PagedResult, UserDropdownRequest } from '../models/common-models';
import { ApplicationUserViewModel } from '../view-models/application-user-view-model';

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

  getUsersForDropdown(req: UserDropdownRequest): Observable<PagedResult<ApplicationUserViewModel>> {
    return this.http.post<PagedResult<ApplicationUserViewModel>>(
      `${this.base}/common/users/dropdown`,
      req
    );
  }


  private scrollHost?: HTMLElement;

  // =========================
  // 注册 / 取消注册 / 自动探测
  // =========================

  /**
   * 注册滚动容器（优先使用注册的容器滚动）
   * 在布局组件（含 mat-sidenav-content 的那层）的 ngAfterViewInit 调用一次即可：
   * this.commonService.registerScrollHost(this.contentEl.nativeElement);
   */
  registerScrollHost(el: HTMLElement) {
    this.scrollHost = el;
  }

  /** 可选：取消注册（路由切换或销毁时） */
  unregisterScrollHost(el?: HTMLElement) {
    if (!el || el === this.scrollHost) {
      this.scrollHost = undefined;
    }
  }

  /**
   * 自动探测最近的可滚动祖先并注册为滚动容器（可作为备用方案）
   * 用法：this.commonService.autoRegisterScrollHostFrom(this.elRef.nativeElement);
   */
  autoRegisterScrollHostFrom(el: HTMLElement) {
    let cur: HTMLElement | null = el;
    while (cur) {
      const style = getComputedStyle(cur);
      const overflowY = style.overflowY;
      // 有纵向滚动条且内容可滚动
      if ((overflowY === 'auto' || overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight) {
        this.scrollHost = cur;
        return;
      }
      cur = cur.parentElement;
    }
    // 没找到就不注册（后续会回退到 window）
  }

  // =========================
  // 内部工具：选择目标（容器 or window）
  // =========================

  /** 当前容器是否可滚动 */
  private isScrollable(el: HTMLElement | undefined): boolean {
    return !!el && el.scrollHeight > el.clientHeight;
  }

  /** 返回当前有效的滚动目标：优先容器，否则 window */
  private getActiveTarget(): 'host' | 'window' {
    return this.isScrollable(this.scrollHost) ? 'host' : 'window';
  }

  // =========================
  // 对外 API：滚动操作（默认平滑）
  // =========================

  /** 滚动到顶部（容器优先；否则 window） */
  scrollToTop(behavior: ScrollBehavior = 'smooth') {
    const target = this.getActiveTarget();
    if (target === 'host') {
      this.scrollHost!.scrollTo({ top: 0, left: 0, behavior });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior });
    }
  }

  /** 滚动到指定 offset（容器优先；否则 window） */
  scrollTo(offset: number, behavior: ScrollBehavior = 'smooth') {
    const target = this.getActiveTarget();
    if (target === 'host') {
      this.scrollHost!.scrollTo({ top: offset, left: 0, behavior });
    } else {
      window.scrollTo({ top: offset, left: 0, behavior });
    }
  }

  /**
   * 滚动到容器内或页面内的某个元素。
   * - 若有容器，则优先在容器内搜索目标并滚动；
   * - 若找不到或无容器，则回退到 document 进行滚动。
   */
  scrollIntoView(target: string | HTMLElement, behavior: ScrollBehavior = 'smooth') {
    let el: HTMLElement | null;

    if (typeof target === 'string') {
      // 容器内优先查找；找不到再到整个文档查
      el = (this.scrollHost?.querySelector(target) as HTMLElement | null)
        ?? (document.querySelector(target) as HTMLElement | null);
    } else {
      el = target;
    }

    if (!el) return;

    // 如果有容器，且目标在容器内：用容器滚动到目标位置（避免 block 算法在某些布局下不合预期）
    if (this.getActiveTarget() === 'host' && this.scrollHost && this.scrollHost.contains(el)) {
      const hostRect = this.scrollHost.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      // 当前滚动距离 + 元素相对容器顶部的偏移
      const nextTop = this.scrollHost.scrollTop + (elRect.top - hostRect.top);
      this.scrollHost.scrollTo({ top: nextTop, behavior });
    } else {
      // 无容器或目标不在容器中：直接用元素自身的 scrollIntoView（作用于 window）
      el.scrollIntoView({ behavior, block: 'start' });
    }
  }

  /** 当前滚动位置（容器优先；否则 window） */
  currentScrollTop(): number {
    return this.getActiveTarget() === 'host'
      ? (this.scrollHost?.scrollTop ?? 0)
      : (window.scrollY ?? document.documentElement.scrollTop ?? 0);
  }

}
