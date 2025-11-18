import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { CompleteRegisterRequest, CompleteRegisterResponse } from '../models/register-models';
import { LoginByPasswordRequest, LoginBySmsRequest, LoginResponse } from '../models/login-models';
import { MeResponse, SendSmsRequest, VerifySmsRequest, VerifySmsResponse } from '../models/authentication-models';
import { ApplicationUserViewModel } from '../view-models/application-user-view-model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private http = inject(HttpClient);
  private base = '/api';

  private _user = signal<ApplicationUserViewModel | null>(null);
  private _known = signal(false); // 是否已完成一次探测

  public readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isKnown = computed(() => this._known());

  refreshSession() {
    if (this._known()) return of(this.isLoggedIn());

    return this.http.get<ApplicationUserViewModel>(`${this.base}/Authentication/me`).pipe(
      tap(user => {
        this._user.set(user ?? null);
        this._known.set(true);
      }),
      map(() => this.isLoggedIn()),
      catchError(() => {
        this._user.set(null);
        this._known.set(true);
        return of(false);
      })
    );
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
