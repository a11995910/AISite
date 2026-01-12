/**
 * 路由汇总
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const departmentRoutes = require('./departments');
const userRoutes = require('./users');
const providerRoutes = require('./providers');
const modelRoutes = require('./models');
const knowledgeBaseRoutes = require('./knowledgeBases');
const agentRoutes = require('./agents');
const statisticsRoutes = require('./statistics');
const chatRoutes = require('./chat');
const settingsRoutes = require('./settings');
const uploadRoutes = require('./upload');

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务正常运行',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// 注册路由
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/users', userRoutes);
router.use('/providers', providerRoutes);
router.use('/models', modelRoutes);
router.use('/knowledge-bases', knowledgeBaseRoutes);
router.use('/agents', agentRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/chat', chatRoutes);
router.use('/settings', settingsRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
