/**
 * 模型服务商路由
 */

const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { adminOnly } = require('../middlewares/auth');

// 获取服务商列表
router.get('/', providerController.getProviders);

// 获取单个服务商
router.get('/:id', providerController.getProvider);

// 创建服务商（需要管理员权限）
router.post('/', adminOnly, providerController.createProvider);

// 更新服务商（需要管理员权限）
router.put('/:id', adminOnly, providerController.updateProvider);

// 删除服务商（需要管理员权限）
router.delete('/:id', adminOnly, providerController.deleteProvider);

module.exports = router;
