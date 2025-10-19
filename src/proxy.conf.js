// proxy.conf.js
const { env } = require('process');

const target =
  env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
      ? env.ASPNETCORE_URLS.split(';')[0]
      : 'https://localhost:7277';

const PROXY_CONFIG = [
  {
    context: [
      '/weatherforecast', // 示例接口
      '/api',             // 你自己的 API 前缀
      '/swagger'          // Swagger UI/JSON
    ],
    target,
    secure: false,        // 本机自签证书一般需要 false
    changeOrigin: true,   // 建议开启
  }
];

module.exports = PROXY_CONFIG;
