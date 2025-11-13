export interface LoginByPasswordRequest {
  account: string;
  password: string;
}
export interface LoginBySmsRequest {
  phone: string;
  code: string;
}
export interface LoginResponse {
  token_type: 'Bearer';          // 令牌类型
  access_token: string;          // 访问 API 时用的 Access Token（必有）
  expires_in?: number;           // Access Token 过期秒数（常见）
  refresh_token?: string;        // 刷新令牌（如果你发了刷新流）
  scope?: string;                // 实际授予的 scopes，空格分隔（如 "openid profile email phone api"）
  id_token?: string;             // ID Token（只有申请了 openid 且你在服务器端配置了签发才会有）
}
