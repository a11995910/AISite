/**
 * 系统设置路由
 */

const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

// 公开路由：获取可用的搜索引擎列表（用户端需要）
router.get('/search-engines', authMiddleware, settingController.getAvailableSearchEngines);

// 以下路由需要管理员权限
router.use(authMiddleware);
router.use(adminOnly);

// 获取所有设置
router.get('/', settingController.getSettings);

// 获取单个设置
router.get('/:key', settingController.getSetting);

// 批量更新设置
router.put('/', settingController.updateSettings);

// 更新单个设置
router.put('/:key', settingController.updateSetting);

// 删除设置
router.delete('/:key', settingController.deleteSetting);

module.exports = router;
