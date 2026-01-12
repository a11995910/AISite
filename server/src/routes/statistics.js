/**
 * 统计路由
 */

const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { adminOnly } = require('../middlewares/auth');

// 获取概览数据
router.get('/overview', statisticsController.getOverview);

// 获取用量统计（需要管理员权限）
router.get('/usage', adminOnly, statisticsController.getUsage);

// 获取趋势数据
router.get('/trends', statisticsController.getTrends);

module.exports = router;
