import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  async verify(): Promise<string> {
    // TODO: 后续接入供应商逻辑，返回 token 或 validate
    return 'MOCK_CAPTCHA_TOKEN';
  }
}
