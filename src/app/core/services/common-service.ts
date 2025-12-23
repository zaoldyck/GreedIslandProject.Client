import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';

import { TagTypeViewModel } from '../view-models/tag-type-view-model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommonService {
  private http = inject(HttpClient);
  private base = '/api';

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

  /** 包装任意 Promise/Observable：自动 begin/end */
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
  getTagTypes(): Observable<TagTypeViewModel[]> {
    return this.http.get<TagTypeViewModel[]>(`${this.base}/common/tagtypes`);
  }
}
