/**
 * JWT认证中间件
 * 验证请求头中的Bearer Token
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User } = require('../models');

/**
 * 认证中间件
 * 验证JWT token并将用户信息附加到请求对象
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 检查是否为公开路由
    const isPublicRoute = jwtConfig.publicRoutes.some(route => 
      req.path.startsWith(route)
    );
    
    if (isPublicRoute) {
      return next();
    }

    // 获取Authorization头
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌',
        data: null
      });
    }

    // 验证Bearer格式
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌格式错误',
        data: null
      });
    }

    const token = parts[1];

    // 验证token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // 查询用户信息
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在',
        data: null
      });
    }

    if (user.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用',
        data: null
      });
    }

    // 将用户信息附加到请求对象
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌已过期',
        data: null
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: '无效的认证令牌',
        data: null
      });
    }

    console.error('认证中间件错误:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

/**
 * 管理员权限检查中间件
 */
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '权限不足，需要管理员权限',
      data: null
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminOnly
};
