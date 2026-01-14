/**
 * 知识库控制器
 * 处理知识库的增删改查操作
 * 支持向量检索（RAG）
 */

const { KnowledgeBase, KnowledgeDocument, KnowledgeChunk, User } = require('../models');
const embeddingService = require('../services/embeddingService');
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

/**
 * 上传文档到知识库
 * POST /api/knowledge-bases/:id/documents
 * 
 * 流程：
 * 1. 解析文档内容
 * 2. 保存文档记录
 * 3. 分块并向量化（异步处理）
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 验证知识库是否存在
    const knowledgeBase = await KnowledgeBase.findByPk(id);
    if (!knowledgeBase) {
      return response.error(res, '知识库不存在', 404);
    }

    if (!req.file) {
      return response.error(res, '请选择要上传的文件', 400);
    }

    const file = req.file;
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    // 解析文档内容
    const { parseDocument } = require('./uploadController');
    let content = '';
    let status = 'processing'; // 初始状态为处理中
    
    try {
      content = await parseDocument(file.path, originalName);
    } catch (error) {
      console.error('文档解析失败:', error);
      status = 'failed';
      content = '';
    }

    // 创建文档记录
    const document = await KnowledgeDocument.create({
      knowledgeBaseId: id,
      fileName: originalName,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      content: content,
      status: status
    });

    // 如果文档解析成功，异步进行分块和向量化
    if (content && status === 'processing') {
      // 异步处理，不阻塞响应
      processDocumentAsync(document.id, parseInt(id), content);
    }

    response.success(res, {
      id: document.id,
      fileName: document.fileName,
      fileSize: document.fileSize,
      status: document.status
    }, '上传成功，正在处理向量化...', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 异步处理文档向量化
 * 不阻塞上传响应
 */
const processDocumentAsync = async (documentId, knowledgeBaseId, content) => {
  try {
    console.log(`[知识库] 开始异步处理文档 ID:${documentId}`);
    
    // 调用 embeddingService 进行分块和向量化
    const result = await embeddingService.processDocument(documentId, knowledgeBaseId, content);
    
    // 更新文档状态
    const newStatus = result.success ? 'completed' : 'failed';
    await KnowledgeDocument.update(
      { status: newStatus },
      { where: { id: documentId } }
    );
    
    console.log(`[知识库] 文档 ID:${documentId} 处理完成，状态: ${newStatus}，分块数: ${result.chunkCount}`);
  } catch (error) {
    console.error(`[知识库] 文档 ID:${documentId} 处理失败:`, error);
    await KnowledgeDocument.update(
      { status: 'failed' },
      { where: { id: documentId } }
    );
  }
};

/**
 * 获取文档内容
 * GET /api/knowledge-bases/:kbId/documents/:docId/content
 */
const getDocumentContent = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const document = await KnowledgeDocument.findByPk(docId);
    if (!document) {
      return response.error(res, '文档不存在', 404);
    }

    response.success(res, {
      id: document.id,
      fileName: document.fileName,
      content: document.content,
      status: document.status
    }, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 检索知识库内容（向量检索）
 * POST /api/knowledge-bases/search
 * 
 * 使用向量相似度进行语义检索
 */
const searchKnowledge = async (req, res, next) => {
  try {
    const { knowledgeBaseIds, query, limit = 5 } = req.body;

    if (!knowledgeBaseIds || knowledgeBaseIds.length === 0) {
      return response.success(res, [], '未选择知识库');
    }

    if (!query || query.trim().length === 0) {
      return response.success(res, [], '查询内容为空');
    }

    console.log(`[知识库检索] 查询: "${query}", 知识库IDs: ${knowledgeBaseIds}`);

    // 1. 生成查询向量
    let queryEmbedding;
    try {
      const embeddings = await embeddingService.generateEmbeddings(query);
      queryEmbedding = embeddings[0];
    } catch (embError) {
      console.error('[知识库检索] 生成查询向量失败:', embError.message);
      // 回退到关键词检索
      return fallbackKeywordSearch(req, res, next, knowledgeBaseIds, query, limit);
    }

    // 2. 向量检索
    const searchResults = await embeddingService.searchByVector(queryEmbedding, knowledgeBaseIds, limit);

    // 3. 格式化结果
    const results = searchResults.map(item => ({
      documentId: item.chunk.documentId,
      fileName: item.chunk.fileName,
      knowledgeBaseName: item.chunk.knowledgeBaseName,
      score: item.similarity,
      snippets: [item.chunk.content]
    }));

    console.log(`[知识库检索] 返回 ${results.length} 个结果`);
    response.success(res, results, '检索成功');
  } catch (error) {
    console.error('[知识库检索] 错误:', error);
    next(error);
  }
};

/**
 * 回退的关键词检索（当向量检索失败时使用）
 */
const fallbackKeywordSearch = async (req, res, next, knowledgeBaseIds, query, limit) => {
  console.log('[知识库检索] 使用关键词回退检索');
  
  const documents = await KnowledgeDocument.findAll({
    where: {
      knowledgeBaseId: knowledgeBaseIds,
      status: 'completed'
    },
    include: [{
      model: KnowledgeBase,
      as: 'knowledgeBase',
      attributes: ['id', 'name']
    }],
    attributes: ['id', 'fileName', 'content', 'knowledgeBaseId']
  });

  const queryKeywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 1);
  const results = [];

  for (const doc of documents) {
    if (!doc.content) continue;
    
    const contentLower = doc.content.toLowerCase();
    let score = 0;
    const matchedParts = [];

    for (const keyword of queryKeywords) {
      const count = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      score += count;
      
      if (count > 0) {
        const index = contentLower.indexOf(keyword);
        const start = Math.max(0, index - 100);
        const end = Math.min(doc.content.length, index + 200);
        const snippet = doc.content.substring(start, end);
        matchedParts.push(`...${snippet}...`);
      }
    }

    if (score > 0) {
      results.push({
        documentId: doc.id,
        fileName: doc.fileName,
        knowledgeBaseName: doc.knowledgeBase?.name,
        score: score,
        snippets: matchedParts.slice(0, 2)
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  response.success(res, results.slice(0, limit), '检索成功（关键词模式）');
};

/**
 * 重新索引文档
 * POST /api/knowledge-bases/:kbId/documents/:docId/reindex
 */
const reindexDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;
    
    const document = await KnowledgeDocument.findByPk(docId);
    if (!document) {
      return response.error(res, '文档不存在', 404);
    }

    if (!document.content) {
      return response.error(res, '文档内容为空，无法索引', 400);
    }

    // 更新状态为处理中
    await document.update({ status: 'processing' });

    // 异步重新索引
    processDocumentAsync(document.id, document.knowledgeBaseId, document.content);

    response.success(res, { id: document.id, status: 'processing' }, '开始重新索引');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文档分块状态
 * GET /api/knowledge-bases/:kbId/documents/:docId/chunks
 */
const getDocumentChunks = async (req, res, next) => {
  try {
    const { docId } = req.params;
    
    const document = await KnowledgeDocument.findByPk(docId);
    if (!document) {
      return response.error(res, '文档不存在', 404);
    }

    const chunks = await KnowledgeChunk.findAll({
      where: { documentId: docId },
      attributes: ['id', 'chunkIndex', 'content', 'tokenCount', 'createdAt'],
      order: [['chunkIndex', 'ASC']]
    });

    // 不返回 embedding 向量（数据量太大）
    const chunksWithStatus = chunks.map(chunk => ({
      id: chunk.id,
      index: chunk.chunkIndex,
      preview: chunk.content.substring(0, 100) + '...',
      tokenCount: chunk.tokenCount,
      hasEmbedding: true // 如果存在记录就有向量
    }));

    response.success(res, {
      documentId: document.id,
      fileName: document.fileName,
      status: document.status,
      totalChunks: chunks.length,
      chunks: chunksWithStatus
    }, '获取成功');
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
  deleteDocument,
  uploadDocument,
  getDocumentContent,
  searchKnowledge,
  reindexDocument,
  getDocumentChunks
};
