/**
 * JWT认证配置
 */

module.exports = {
  // JWT密钥
  secret: process.env.JWT_SECRET || 'default-secret-key',
  
  // Token过期时间
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Token类型
  tokenType: 'Bearer',
  
  // 不需要认证的路由（路径不包含/api前缀，因为中间件挂载在/api下）
  publicRoutes: [
    '/auth/login',
    '/auth/register',
    '/health',
    '/chat/embed/stream', // SDK嵌入式对话接口
    '/chat/embed/config'  // SDK嵌入式配置接口
  ]
};
