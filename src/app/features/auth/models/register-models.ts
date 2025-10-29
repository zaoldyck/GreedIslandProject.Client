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
  reason: string;
  registerTicket: string;
}

export interface CompleteRegisterRequest {
  registerTicket: string;
  displayName?: string | null;
  email?: string | null;
  password?: string | null;
  autoLogin: boolean;     // 是否注册后直接建立 Cookie 登录
}

export interface CompleteRegisterResponse {
  ok: boolean;
  userId: string;
  isNew: boolean;
}
