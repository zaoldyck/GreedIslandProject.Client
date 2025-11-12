export interface LoginByPasswordRequest {
  account: string;
  password: string;
}
export interface LoginBySmsRequest {
  phone: string;
  code: string;
}
export interface LoginResponse {
  account: string;
  ok: boolean; // 是否登录成功
  token?: string; // JWT 或访问令牌
}
