/**
 * 知识库路由
 */

const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');

/**
 * 权限检查中间件
 * 管理员可以管理所有知识库
 * 普通用户只能管理自己的个人知识库
 */
const kbPermission = async (req, res, next) => {
  // 管理员直接放行
  if (req.user.role === 'admin') {
    return next();
  }
  
  // 创建知识库时，检查type是否为personal
  if (req.method === 'POST' && !req.params.id) {
    if (req.body.type !== 'personal') {
      return res.status(403).json({
        code: 403,
        message: '普通用户只能创建个人知识库',
        data: null
      });
    }
    return next();
  }
  
  // 对于更新、删除等操作，检查知识库所有权
  const kbId = req.params.id || req.params.kbId;
  if (kbId) {
    const { KnowledgeBase } = require('../models');
    const kb = await KnowledgeBase.findByPk(kbId);
    
    if (!kb) {
      return res.status(404).json({
        code: 404,
        message: '知识库不存在',
        data: null
      });
    }
    
    // 只能操作自己的个人知识库
    if (kb.type !== 'personal' || kb.ownerId !== req.userId) {
      return res.status(403).json({
        code: 403,
        message: '无权操作此知识库',
        data: null
      });
    }
  }
  
  next();
};

// 获取知识库列表
router.get('/', knowledgeController.getKnowledgeBases);

// 获取单个知识库
router.get('/:id', knowledgeController.getKnowledgeBase);

// 创建知识库（管理员或创建个人知识库）
router.post('/', kbPermission, knowledgeController.createKnowledgeBase);

// 更新知识库（管理员或知识库所有者）
router.put('/:id', kbPermission, knowledgeController.updateKnowledgeBase);

// 删除知识库（管理员或知识库所有者）
router.delete('/:id', kbPermission, knowledgeController.deleteKnowledgeBase);

// 获取知识库文档
router.get('/:id/documents', knowledgeController.getDocuments);

// 上传文档到知识库（管理员或知识库所有者）
const { upload } = require('../controllers/uploadController');
router.post('/:id/documents', kbPermission, upload.single('file'), knowledgeController.uploadDocument);

// 获取文档内容
router.get('/:kbId/documents/:docId/content', knowledgeController.getDocumentContent);

// 删除文档（管理员或知识库所有者）
router.delete('/:kbId/documents/:docId', kbPermission, knowledgeController.deleteDocument);

// 重新索引文档（管理员或知识库所有者）
router.post('/:kbId/documents/:docId/reindex', kbPermission, knowledgeController.reindexDocument);

// 获取文档分块状态
router.get('/:kbId/documents/:docId/chunks', knowledgeController.getDocumentChunks);

// 检索知识库内容（向量检索）
router.post('/search', knowledgeController.searchKnowledge);

module.exports = router;

