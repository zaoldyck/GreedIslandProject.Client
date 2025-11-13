import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { CompleteRegisterRequest, CompleteRegisterResponse } from '../models/register-models';
import { LoginByPasswordRequest, LoginBySmsRequest, LoginResponse } from '../models/login-models';
import { SendSmsRequest, VerifySmsRequest, VerifySmsResponse } from '../models/authentication-models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private http = inject(HttpClient);
  private base = '/api';

  loginWithSms(request: LoginBySmsRequest): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('grant_type', 'sms_otp');      // 自定义的 grant
    body.set('phone', request.phone);
    body.set('code', request.code);
    body.set('client_id', 'spa');   // 公开客户端
    // body.set('client_secret', '...');       // 若是保密客户端才需要（SPA 一般不要用）
    body.set('scope', 'openid profile email phone api');    // 视你的配置
    return this.http.post<LoginResponse>('/connect/token', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
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
