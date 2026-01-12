/**
 * 知识库路由
 */

const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const { adminOnly } = require('../middlewares/auth');

// 获取知识库列表
router.get('/', knowledgeController.getKnowledgeBases);

// 获取单个知识库
router.get('/:id', knowledgeController.getKnowledgeBase);

// 创建知识库（需要管理员权限）
router.post('/', adminOnly, knowledgeController.createKnowledgeBase);

// 更新知识库（需要管理员权限）
router.put('/:id', adminOnly, knowledgeController.updateKnowledgeBase);

// 删除知识库（需要管理员权限）
router.delete('/:id', adminOnly, knowledgeController.deleteKnowledgeBase);

// 获取知识库文档
router.get('/:id/documents', knowledgeController.getDocuments);

// 删除文档（需要管理员权限）
router.delete('/:kbId/documents/:docId', adminOnly, knowledgeController.deleteDocument);

module.exports = router;
