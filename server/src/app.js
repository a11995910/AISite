/**
 * Express应用主入口
 * 企业级AI应用平台 - 后端服务
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { sequelize, testConnection } = require('./config/database');
const { authMiddleware } = require('./middlewares/auth');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

// 导入模型以初始化关联
require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 请求日志（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// JWT认证中间件
app.use('/api', authMiddleware);

// API路由
app.use('/api', routes);

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

/**
 * 启动服务器
 */
const startServer = async () => {
  try {
    // 测试数据库连接
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ 无法连接数据库，请检查配置');
      process.exit(1);
    }

    // 同步数据库模型（开发环境）
    if (process.env.NODE_ENV === 'development') {
      // 使用普通sync，不修改已存在的表结构
      await sequelize.sync();
      console.log('✅ 数据库模型同步完成');
    }

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 企业级AI应用平台 - 后端服务启动成功              ║
║                                                        ║
║   📍 服务地址: http://localhost:${PORT}                 ║
║   📍 API地址:  http://localhost:${PORT}/api             ║
║   📍 健康检查: http://localhost:${PORT}/api/health      ║
║                                                        ║
║   📦 环境: ${process.env.NODE_ENV || 'development'}                              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
