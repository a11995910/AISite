/**
 * 知识库模型
 * 管理企业级和个人知识库
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KnowledgeBase = sequelize.define('knowledge_bases', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '知识库ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '知识库名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '描述'
  },
  type: {
    type: DataTypes.ENUM('enterprise', 'personal'),
    defaultValue: 'enterprise',
    comment: '类型：enterprise企业 personal个人'
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'owner_id',
    comment: '所有者ID（个人知识库）'
  },
  isActive: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    field: 'is_active',
    comment: '是否启用'
  }
}, {
  tableName: 'knowledge_bases',
  comment: '知识库表'
});

module.exports = KnowledgeBase;
