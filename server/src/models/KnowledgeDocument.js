/**
 * 知识库文档模型
 * 管理知识库中的文档文件
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KnowledgeDocument = sequelize.define('knowledge_documents', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '文档ID'
  },
  knowledgeBaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'knowledge_base_id',
    comment: '知识库ID'
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'file_name',
    comment: '文件名'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_path',
    comment: '文件路径'
  },
  fileType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'file_type',
    comment: '文件类型'
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'file_size',
    comment: '文件大小（字节）'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
    comment: '处理状态'
  }
}, {
  tableName: 'knowledge_documents',
  comment: '知识库文档表'
});

module.exports = KnowledgeDocument;
