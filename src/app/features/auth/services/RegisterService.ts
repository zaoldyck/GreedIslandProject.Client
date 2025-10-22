import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompleteRegisterRequest, CompleteRegisterResponse, SendSmsRequest, VerifySmsRequest, VerifySmsResponse } from '../models/RegisterModels';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private base = '/api';

  constructor(private http: HttpClient) { }

  sendSms(body: SendSmsRequest): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/auth/sms/send`, body);
  }

  verifySms(body: VerifySmsRequest): Observable<VerifySmsResponse> {
    return this.http.post<VerifySmsResponse>(`${this.base}/auth/sms/verify`, body);
  }

  completeRegister(body: CompleteRegisterRequest): Observable<CompleteRegisterResponse> {
    return this.http.post<CompleteRegisterResponse>(`${this.base}/auth/register/complete`, body);
  }
}
