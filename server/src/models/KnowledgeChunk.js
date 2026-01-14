/**
 * 知识库文本块模型
 * 存储文档分块及其向量表示
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * KnowledgeChunk - 知识库文本块
 * 
 * 用途：
 * - 存储文档分块后的文本内容
 * - 存储文本块的向量嵌入（Embedding）
 * - 支持向量相似度检索
 */
const KnowledgeChunk = sequelize.define('knowledge_chunks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  documentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'document_id',
    comment: '关联文档ID'
  },
  knowledgeBaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'knowledge_base_id',
    comment: '关联知识库ID'
  },
  chunkIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'chunk_index',
    comment: '块序号（从0开始）'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '文本内容'
  },
  embedding: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '向量数据（数组形式存储）'
  },
  tokenCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'token_count',
    comment: 'Token数量估算'
  }
}, {
  tableName: 'knowledge_chunks',
  comment: '知识库文本块表'
});

module.exports = KnowledgeChunk;
