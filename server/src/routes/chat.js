/**
 * 对话路由
 * 处理对话和消息的CRUD操作
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// 获取对话列表
router.get('/conversations', chatController.getConversations);

// 创建新对话
router.post('/conversations', chatController.createConversation);

// 获取单个对话
router.get('/conversations/:id', chatController.getConversation);

// 更新对话
router.put('/conversations/:id', chatController.updateConversation);

// 删除对话
router.delete('/conversations/:id', chatController.deleteConversation);

// 获取对话消息
router.get('/conversations/:id/messages', chatController.getMessages);

// 发送消息（普通响应）
router.post('/conversations/:id/messages', chatController.sendMessage);

// 发送消息（流式响应）
router.post('/conversations/:id/messages/stream', chatController.sendMessageStream);

module.exports = router;
