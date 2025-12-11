import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { ProvinceViewModel } from '../view-models/province-view-model';
import { Constants } from '../constants/constants';

@Injectable({ providedIn: 'root' })
export class CommonService {
  private http = inject(HttpClient);
  private base = '/api';

  private provinceSig = signal<string | null>(this.loadProvinceFromLS());
  public province = computed(() => this.provinceSig());

  getPreferredProvinceId(): Observable<string> {
    const cached = this.provinceSig();
    if (cached) return of(cached); // 命中内存缓存

    return this.http.get<ProvinceViewModel>(`${this.base}/common/preferred-province`).pipe(
      // 1) 统一类型为 string（方法签名一致）
      map(resp => {
        const id = resp.id;
        if (id == null) throw new Error('Preferred province id is null');
        return id;
      }),

      // 2) 成功时的副作用（写入 signal + LocalStorage）
      tap(id => {
        this.provinceSig.set(id);
        localStorage.setItem(Constants.preferredProvinceIdKey, id);
      }),

      // 3) 失败时的清理，并把错误继续抛给调用方（不在服务层兜底）
      catchError(err => {
        this.provinceSig.set(null);
        localStorage.removeItem(Constants.preferredProvinceIdKey);
        return throwError(() => err);
      }),

      // 4) 最后缓存成功结果，避免同一次调用被多个订阅重复发请求
      shareReplay(1)
    );
  }

  /** 后端优先时用于写入：更新 signal + localStorage */
  setPreferredProvinceId(id: string): void {
    this.provinceSig.set(id);
    try {
      localStorage.setItem(Constants.preferredProvinceIdKey, id);
    } catch { /* SSR/隐私模式下可能抛错，忽略 */ }
  }

  private loadProvinceFromLS(): string | null {
    try {
      return localStorage.getItem(Constants.preferredProvinceIdKey) || null;
    } catch {
      return null;
    }
  }

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
}

