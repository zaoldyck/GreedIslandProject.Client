import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompleteRegisterRequest, CompleteRegisterResponse, SendSmsRequest, VerifySmsRequest, VerifySmsResponse } from '../models/register-models';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private base = '/api';

  constructor(private http: HttpClient) { }

  sendSms(request: SendSmsRequest): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/Notification/sms/send`, request);
  }

  verifySms(request: VerifySmsRequest): Observable<VerifySmsResponse> {
    return this.http.post<VerifySmsResponse>(`${this.base}/Notification/sms/verify`, request);
  }

  completeRegister(request: CompleteRegisterRequest): Observable<CompleteRegisterResponse> {
    return this.http.post<CompleteRegisterResponse>(`${this.base}/auth/register/complete`, request);
  }
}
