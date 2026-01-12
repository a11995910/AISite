/**
 * AI模型
 * 管理各个服务商下的具体模型配置
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Model = sequelize.define('models', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '模型ID'
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'provider_id',
    comment: '服务商ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '模型显示名称'
  },
  modelId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'model_id',
    comment: '模型标识符'
  },
  type: {
    type: DataTypes.ENUM('chat', 'image', 'embedding'),
    allowNull: false,
    comment: '模型类型：chat对话 image绘图 embedding向量'
  },
  isDefault: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    field: 'is_default',
    comment: '是否默认模型'
  },
  maxTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 4096,
    field: 'max_tokens',
    comment: '最大token数'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '模型描述'
  },
  isActive: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    field: 'is_active',
    comment: '是否启用'
  }
}, {
  tableName: 'models',
  comment: '模型表'
});

module.exports = Model;
