// proxy.conf.js
const { env } = require('process');

const target =
  env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
      ? env.ASPNETCORE_URLS.split(';')[0]   // e.g. https://localhost:7277
      : 'https://localhost:7277';

/**
 * 要代理到后端的上下文路径列表：
 * - /api                    你的业务 API
 * - /swagger                Swagger UI/JSON
 * - /weatherforecast        示例接口
 * - /connect/*              OpenIddict 的标准端点（token/authorize/userinfo/logout）
 * - /.well-known/*          OIDC 元数据与 JWK
 * - /signin-oidc            （如使用授权码 + PKCE + cookies 回调时可能需要）
 */
const PROXY_CONFIG = [
  {
    context: [
      '/api',
      '/swagger',
      '/weatherforecast',

      // OpenIddict/OIDC 相关
      '/connect/authorize',
      '/connect/token',
      '/connect/userinfo',
      '/connect/logout',
      '/.well-known/openid-configuration',
      '/.well-known/jwks',

      // 如果你的授权码流程使用 cookie 回调（典型的服务器端处理），可以加上：
      '/signin-oidc',
    ],
    target,
    secure: false,        // 开发环境自签证书，关闭证书校验
    changeOrigin: true,   // 伪造 Host 为后端域，常规建议开启
    ws: false,            // 如果后端没用到 WebSocket，可以关闭
    // 可选：如果后端期望 Host 是 localhost，可指定：
    // headers: { Host: 'localhost' },
    // 可选：需要调试时打开日志
    // logLevel: 'debug',
  }
];

module.exports = PROXY_CONFIG;
