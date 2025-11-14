import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of } from 'rxjs';
import { CompleteRegisterRequest, CompleteRegisterResponse } from '../../features/authentication/models/register-models';
import { LoginByPasswordRequest, LoginBySmsRequest, LoginResponse } from '../../features/authentication/models/login-models';
import { SendSmsRequest, VerifySmsRequest, VerifySmsResponse } from '../../features/authentication/models/authentication-models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private http = inject(HttpClient);
  private base = '/api';

  loginWithSms(request: LoginBySmsRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.base}/Authentication/LoginWithSms`,
      request
    );
  }
  /** Cookie 模式下向后端探测是否已登录 */
  checkSession() {
    return this.http.get<{ authenticated: boolean }>(`${this.base}/Authentication/Me`).pipe(
      map(res => !!res?.authenticated),
      // 如果还没接入 401→Refresh 拦截器，兜底当成未登录：
      catchError(() => of(false))
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
