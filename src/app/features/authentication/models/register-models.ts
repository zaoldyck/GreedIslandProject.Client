// contracts.ts 或 api-contracts.ts
export interface CompleteRegisterRequest {
  verificationTicket: string;
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
