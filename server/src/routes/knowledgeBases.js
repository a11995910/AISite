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

// 上传文档到知识库（需要管理员权限）
const { upload } = require('../controllers/uploadController');
router.post('/:id/documents', adminOnly, upload.single('file'), knowledgeController.uploadDocument);

// 获取文档内容
router.get('/:kbId/documents/:docId/content', knowledgeController.getDocumentContent);

// 删除文档（需要管理员权限）
router.delete('/:kbId/documents/:docId', adminOnly, knowledgeController.deleteDocument);

// 重新索引文档（需要管理员权限）
router.post('/:kbId/documents/:docId/reindex', adminOnly, knowledgeController.reindexDocument);

// 获取文档分块状态
router.get('/:kbId/documents/:docId/chunks', knowledgeController.getDocumentChunks);

// 检索知识库内容（向量检索）
router.post('/search', knowledgeController.searchKnowledge);

module.exports = router;
