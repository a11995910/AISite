/**
 * Agent路由
 */

const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { adminOnly } = require('../middlewares/auth');

// 获取Agent列表
router.get('/', agentController.getAgents);

// 创建企业Agent（需要管理员权限）
router.post('/', adminOnly, agentController.createAgent);

// 创建个人Agent（普通用户可用）
router.post('/personal', agentController.createPersonalAgent);

// 一键生成系统提示词
router.post('/generate-prompt', agentController.generateAgentPrompt);

// 获取单个Agent
router.get('/:id', agentController.getAgent);

// 更新Agent（需要管理员权限或个人Agent所有者）
router.put('/:id', agentController.updateAgent);

// 删除Agent（需要管理员权限或个人Agent所有者）
router.delete('/:id', agentController.deleteAgent);

module.exports = router;
