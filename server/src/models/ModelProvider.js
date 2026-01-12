/**
 * 模型服务商
 * 用于管理不同的AI模型API提供商
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ModelProvider = sequelize.define('model_providers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '服务商ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '服务商名称'
  },
  apiType: {
    type: DataTypes.ENUM('openai', 'claude', 'gemini', 'custom'),
    allowNull: false,
    field: 'api_type',
    comment: 'API类型'
  },
  baseUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'base_url',
    comment: 'API基础URL'
  },
  apiKey: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'api_key',
    comment: 'API密钥'
  },
  isActive: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    field: 'is_active',
    comment: '是否启用'
  }
}, {
  tableName: 'model_providers',
  comment: '模型服务商表'
});

module.exports = ModelProvider;
