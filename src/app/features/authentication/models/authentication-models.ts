export interface SendSmsRequest {
  phone: string;
  purpose: 'register' | 'login';        // 'register'
  captchaToken: string;   // 行为验证码票据（暂留空字符串占位）
}

export interface VerifySmsRequest {
  phone: string;
  purpose: 'register' | 'login';        // 'register'
  code: string;
}

export interface VerifySmsResponse {
  success: boolean;
  reason?: string | null;
  verificationTicket?: string | null;
}
