import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, REQUEST, signal } from '@angular/core';
import { catchError, delay, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { CompleteRegisterRequest, CompleteRegisterResponse } from '../models/register-models';
import { LoginByPasswordRequest, LoginBySmsRequest, LoginResponse } from '../models/login-models';
import { MeResponse, SendSmsRequest, VerifySmsRequest, VerifySmsResponse } from '../models/authentication-models';
import { ApplicationUserViewModel } from '../view-models/application-user-view-model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private http = inject(HttpClient);
  /** 仅 SSR 时有值；CSR 为空 */
  private req = inject(REQUEST);
  private base = '/api';

  private _user = signal<ApplicationUserViewModel | null>(null);
  private _known = signal(false); // 是否已完成一次探测

  public readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isKnown = computed(() => this._known());

  private refreshing$?: Observable<boolean>; // 正在进行的刷新请求（复用）

  refreshSession(force = false): Observable<boolean> {
    if (!force && this._known()) {
      return of(this.isLoggedIn());
    }

    // 已有进行中的请求：直接复用（避免并发）
    if (this.refreshing$ && !force) {
      return this.refreshing$;
    }

    const req$ = this.http.get<ApplicationUserViewModel>(
      `${this.base}/Authentication/me`,
      { withCredentials: true } // Cookie 会话必需；Bearer Token 模式靠拦截器
    ).pipe(
      tap(user => {
        this._user.set(user ?? null);
        this._known.set(true);
      }),
      map(() => this.isLoggedIn()),
      catchError(() => {
        this._user.set(null);
        this._known.set(true);
        return of(false);
      }),
      finalize(() => { this.refreshing$ = undefined; }),
      shareReplay({ bufferSize: 1, refCount: true }) // 关键：复用结果
    );

    this.refreshing$ = req$;
    return req$;
  }

  markUnknown() { this._known.set(false); }

  /** SSR：根据 Cookie 是否存在快速判断；CSR：返回 null */
  public isLoggedInOnServer(): boolean | null {
    if (!this.req) return null; // 浏览器或 prerender 阶段
    // Angular 20 的 REQUEST 是 Web API Request：headers 为 Headers
    const cookie = this.req.headers.get('cookie') ?? '';
    // 根据 ASP.NET Core Identity 默认 Cookie 名匹配（你说用的是 Identity.Application）
    return /\.AspNetCore\.Identity\.Application=([^;]+)/.test(cookie);
  }

  loginWithSms(request: LoginBySmsRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.base}/Authentication/LoginWithSms`,
      request
    );
  }
  logout(): Observable<void> {
    return this.http.post<{ ok: boolean }>(`${this.base}/Authentication/logout`, {})
      .pipe(
        tap({
          next: _ => {
            this._user.set(null);
            this._known.set(true);
          },
          error: _ => {
            // 即使后端报错，本地也强制清空，以免假在线
            this._user.set(null);
            this._known.set(true);
          }
        }),
        map(() => void 0)
      );
  }
  sendSms(request: SendSmsRequest): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/Notification/sms/send`, request);
  }

  verifySms(request: VerifySmsRequest): Observable<VerifySmsResponse> {
    return this.http.post<VerifySmsResponse>(`${this.base}/Notification/sms/verify`, request);
  }

  completeRegister(request: CompleteRegisterRequest): Observable<CompleteRegisterResponse> {
    return this.http.post<CompleteRegisterResponse>(`${this.base}/Authentication/register/complete`, request);
  }
}
