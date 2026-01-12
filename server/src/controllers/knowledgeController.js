/**
 * 知识库控制器
 * 处理知识库的增删改查操作
 */

const { KnowledgeBase, KnowledgeDocument, User } = require('../models');
const response = require('../utils/response');
const path = require('path');
const fs = require('fs');

/**
 * 获取知识库列表
 * GET /api/knowledge-bases
 */
const getKnowledgeBases = async (req, res, next) => {
  try {
    const { type, isActive } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    // 企业知识库：全部可见
    // 个人知识库：只能看自己的
    if (type === 'personal') {
      where.ownerId = req.userId;
    }

    const knowledgeBases = await KnowledgeBase.findAll({
      where,
      include: [
        {
          model: KnowledgeDocument,
          as: 'documents',
          attributes: ['id', 'fileName', 'fileType', 'status']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    response.success(res, knowledgeBases, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个知识库
 * GET /api/knowledge-bases/:id
 */
const getKnowledgeBase = async (req, res, next) => {
  try {
    const { id } = req.params;

    const knowledgeBase = await KnowledgeBase.findByPk(id, {
      include: [
        {
          model: KnowledgeDocument,
          as: 'documents'
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!knowledgeBase) {
      return response.error(res, '知识库不存在', 404);
    }

    response.success(res, knowledgeBase, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建知识库
 * POST /api/knowledge-bases
 */
const createKnowledgeBase = async (req, res, next) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return response.error(res, '知识库名称不能为空', 400);
    }

    const knowledgeBase = await KnowledgeBase.create({
      name,
      description,
      type: type || 'enterprise',
      ownerId: type === 'personal' ? req.userId : null
    });

    response.success(res, knowledgeBase, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新知识库
 * PUT /api/knowledge-bases/:id
 */
const updateKnowledgeBase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const knowledgeBase = await KnowledgeBase.findByPk(id);
    if (!knowledgeBase) {
      return response.error(res, '知识库不存在', 404);
    }

    await knowledgeBase.update({
      name: name !== undefined ? name : knowledgeBase.name,
      description: description !== undefined ? description : knowledgeBase.description,
      isActive: isActive !== undefined ? isActive : knowledgeBase.isActive
    });

    response.success(res, knowledgeBase, '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除知识库
 * DELETE /api/knowledge-bases/:id
 */
const deleteKnowledgeBase = async (req, res, next) => {
  try {
    const { id } = req.params;

    const knowledgeBase = await KnowledgeBase.findByPk(id);
    if (!knowledgeBase) {
      return response.error(res, '知识库不存在', 404);
    }

    // 删除关联的文档记录
    await KnowledgeDocument.destroy({ where: { knowledgeBaseId: id } });
    
    await knowledgeBase.destroy();
    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取知识库文档列表
 * GET /api/knowledge-bases/:id/documents
 */
const getDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const documents = await KnowledgeDocument.findAll({
      where: { knowledgeBaseId: id },
      order: [['createdAt', 'DESC']]
    });

    response.success(res, documents, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除文档
 * DELETE /api/knowledge-bases/:kbId/documents/:docId
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const document = await KnowledgeDocument.findByPk(docId);
    if (!document) {
      return response.error(res, '文档不存在', 404);
    }

    // 删除实际文件
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.destroy();
    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKnowledgeBases,
  getKnowledgeBase,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
  getDocuments,
  deleteDocument
};
