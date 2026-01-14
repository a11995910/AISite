/**
 * Embedding 服务
 * 提供文本向量化和向量检索功能
 * 
 * 核心功能：
 * - 文本分块（Chunking）
 * - 调用 Embedding API 生成向量
 * - 向量相似度计算
 * - 向量检索
 */

const { Model, ModelProvider } = require('../models');

/**
 * 默认配置
 */
const CONFIG = {
  // 分块大小（字符数）
  CHUNK_SIZE: 800,
  // 分块重叠大小（字符数）
  CHUNK_OVERLAP: 100,
  // 最小块大小（小于此值与前一块合并）
  MIN_CHUNK_SIZE: 100,
  // 默认返回的Top-K数量
  DEFAULT_TOP_K: 5
};

/**
 * 获取配置的 Embedding 模型信息
 * 
 * @returns {Promise<{apiBase: string, apiKey: string, modelName: string}|null>}
 */
const getEmbeddingModel = async () => {
  try {
    const model = await Model.findOne({
      where: {
        type: 'embedding',
        isDefault: 1,
        isActive: 1
      },
      include: [{
        model: ModelProvider,
        as: 'provider',
        where: { isActive: 1 }
      }]
    });

    if (model && model.provider) {
      return {
        apiBase: model.provider.baseUrl,
        apiKey: model.provider.apiKey,
        modelName: model.modelId
      };
    }
    return null;
  } catch (error) {
    console.error('[Embedding] 获取模型配置失败:', error);
    return null;
  }
};

/**
 * 文本分块
 * 将长文本切分为多个较小的文本块，带重叠
 * 
 * @param {string} text - 原始文本
 * @param {number} chunkSize - 块大小，默认800
 * @param {number} overlap - 重叠大小，默认100
 * @returns {Array<{index: number, content: string, tokenCount: number}>} 分块结果
 */
const splitTextIntoChunks = (text, chunkSize = CONFIG.CHUNK_SIZE, overlap = CONFIG.CHUNK_OVERLAP) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    // 计算块的结束位置
    let end = start + chunkSize;
    
    // 如果不是最后一块，尝试在句子边界处切分
    if (end < text.length) {
      // 查找最近的句子结束符
      const searchEnd = Math.min(end + 100, text.length);
      const slice = text.slice(end, searchEnd);
      const sentenceEndMatch = slice.match(/[。！？.!?\n]/);
      
      if (sentenceEndMatch) {
        end = end + sentenceEndMatch.index + 1;
      }
    } else {
      end = text.length;
    }

    const chunkContent = text.slice(start, end).trim();
    
    // 跳过过短的块（最后一块除外）
    if (chunkContent.length >= CONFIG.MIN_CHUNK_SIZE || start + chunkSize >= text.length) {
      chunks.push({
        index: index++,
        content: chunkContent,
        // 简单估算：中文1字≈1.5 token，英文1词≈1 token
        tokenCount: Math.ceil(chunkContent.length * 0.8)
      });
    }

    // 下一块的起始位置（带重叠）
    start = end - overlap;
    
    // 防止无限循环
    if (start >= text.length - CONFIG.MIN_CHUNK_SIZE) {
      break;
    }
  }

  return chunks;
};

/**
 * 生成文本的向量嵌入
 * 调用 Embedding API 将文本转换为向量
 * 
 * @param {string|Array<string>} texts - 单个文本或文本数组
 * @returns {Promise<Array<Array<number>>>} 向量数组
 */
const generateEmbeddings = async (texts) => {
  const modelConfig = await getEmbeddingModel();
  
  if (!modelConfig) {
    throw new Error('未配置 Embedding 模型，请在管理端配置');
  }

  const { apiBase, apiKey, modelName } = modelConfig;
  
  if (!apiKey) {
    throw new Error('Embedding 模型未配置 API Key');
  }

  // 确保 texts 是数组
  const inputTexts = Array.isArray(texts) ? texts : [texts];
  
  console.log(`[Embedding] 开始向量化 ${inputTexts.length} 个文本块，使用模型: ${modelName}`);

  try {
    const fetch = (await import('node-fetch')).default;
    
    // 调用 Embedding API (兼容 OpenAI 格式)
    const response = await fetch(`${apiBase}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        input: inputTexts,
        encoding_format: 'float'
      }),
      timeout: 60000
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Embedding] API 响应错误:', response.status, errorText);
      throw new Error(`Embedding API 请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // OpenAI API 格式: { data: [{ embedding: [...], index: 0 }] }
    if (data.data && Array.isArray(data.data)) {
      // 按 index 排序，确保顺序正确
      const sortedData = data.data.sort((a, b) => a.index - b.index);
      const embeddings = sortedData.map(item => item.embedding);
      
      console.log(`[Embedding] 成功生成 ${embeddings.length} 个向量，维度: ${embeddings[0]?.length || 0}`);
      return embeddings;
    }

    throw new Error('Embedding API 返回格式异常');
  } catch (error) {
    console.error('[Embedding] 向量化失败:', error);
    throw error;
  }
};

/**
 * 计算两个向量的余弦相似度
 * 
 * @param {Array<number>} vec1 - 向量1
 * @param {Array<number>} vec2 - 向量2
 * @returns {number} 相似度 (0-1之间)
 */
const cosineSimilarity = (vec1, vec2) => {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
};

/**
 * 在知识库中进行向量检索
 * 
 * @param {Array<number>} queryEmbedding - 查询文本的向量
 * @param {Array<number>} knowledgeBaseIds - 知识库ID列表
 * @param {number} topK - 返回的结果数量
 * @returns {Promise<Array<{chunk: object, similarity: number}>>} 检索结果
 */
const searchByVector = async (queryEmbedding, knowledgeBaseIds, topK = CONFIG.DEFAULT_TOP_K) => {
  const { KnowledgeChunk, KnowledgeDocument, KnowledgeBase } = require('../models');
  
  // 获取所有相关的文本块
  const chunks = await KnowledgeChunk.findAll({
    where: {
      knowledgeBaseId: knowledgeBaseIds
    },
    include: [
      {
        model: KnowledgeDocument,
        as: 'document',
        attributes: ['id', 'fileName']
      },
      {
        model: KnowledgeBase,
        as: 'knowledgeBase',
        attributes: ['id', 'name']
      }
    ]
  });

  console.log(`[Embedding] 检索 ${chunks.length} 个文本块，来自 ${knowledgeBaseIds.length} 个知识库`);

  if (chunks.length === 0) {
    return [];
  }

  // 计算每个块与查询的相似度
  const results = chunks
    .filter(chunk => chunk.embedding && Array.isArray(chunk.embedding))
    .map(chunk => ({
      chunk: {
        id: chunk.id,
        content: chunk.content,
        documentId: chunk.documentId,
        fileName: chunk.document?.fileName,
        knowledgeBaseId: chunk.knowledgeBaseId,
        knowledgeBaseName: chunk.knowledgeBase?.name,
        chunkIndex: chunk.chunkIndex
      },
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  console.log(`[Embedding] Top-${topK} 结果:`, results.map(r => ({
    fileName: r.chunk.fileName,
    similarity: r.similarity.toFixed(4)
  })));

  return results;
};

/**
 * 对文档进行分块并向量化
 * 
 * @param {number} documentId - 文档ID
 * @param {number} knowledgeBaseId - 知识库ID
 * @param {string} content - 文档文本内容
 * @returns {Promise<{success: boolean, chunkCount: number, error?: string}>}
 */
const processDocument = async (documentId, knowledgeBaseId, content) => {
  const { KnowledgeChunk } = require('../models');
  
  try {
    console.log(`[Embedding] 开始处理文档 ID:${documentId}`);
    
    // 1. 删除该文档的旧分块（重新索引场景）
    await KnowledgeChunk.destroy({
      where: { documentId }
    });

    // 2. 分块
    const chunks = splitTextIntoChunks(content);
    
    if (chunks.length === 0) {
      console.log('[Embedding] 文档内容为空或过短，无法分块');
      return { success: true, chunkCount: 0 };
    }

    console.log(`[Embedding] 文档分为 ${chunks.length} 个块`);

    // 3. 批量生成向量
    const chunkContents = chunks.map(c => c.content);
    const embeddings = await generateEmbeddings(chunkContents);

    // 4. 批量保存到数据库
    const chunkRecords = chunks.map((chunk, idx) => ({
      documentId,
      knowledgeBaseId,
      chunkIndex: chunk.index,
      content: chunk.content,
      embedding: embeddings[idx],
      tokenCount: chunk.tokenCount
    }));

    await KnowledgeChunk.bulkCreate(chunkRecords);
    
    console.log(`[Embedding] 文档处理完成，保存 ${chunkRecords.length} 个向量块`);
    
    return { success: true, chunkCount: chunkRecords.length };
  } catch (error) {
    console.error(`[Embedding] 文档处理失败:`, error);
    return { success: false, chunkCount: 0, error: error.message };
  }
};

module.exports = {
  CONFIG,
  getEmbeddingModel,
  splitTextIntoChunks,
  generateEmbeddings,
  cosineSimilarity,
  searchByVector,
  processDocument
};
