/**
 * 模型路由
 */

const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const { adminOnly } = require('../middlewares/auth');

// 获取默认模型
router.get('/defaults', modelController.getDefaults);

// 获取用户可用的模型列表（权限过滤，用户端使用）
router.get('/available', modelController.getAvailableModels);

// 获取模型列表（管理端使用）
router.get('/', modelController.getModels);

// 获取单个模型
router.get('/:id', modelController.getModel);

// 创建模型（需要管理员权限）
router.post('/', adminOnly, modelController.createModel);

// 更新模型（需要管理员权限）
router.put('/:id', adminOnly, modelController.updateModel);

// 设为默认模型（需要管理员权限）
router.put('/:id/default', adminOnly, modelController.setDefault);

// 删除模型（需要管理员权限）
router.delete('/:id', adminOnly, modelController.deleteModel);

module.exports = router;
