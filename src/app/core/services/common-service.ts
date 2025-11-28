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

  private loadProvinceFromLS(): string | null {
    try {
      return localStorage.getItem(Constants.preferredProvinceIdKey) || null;
    } catch {
      return null;
    }
  }
}
