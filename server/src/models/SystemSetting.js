/**
 * 系统设置模型
 * 存储系统级配置，如搜索API密钥等
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSetting = sequelize.define('system_settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 设置键名
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '设置键名'
  },
  // 设置值
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '设置值'
  },
  // 设置类型
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string',
    comment: '值类型'
  },
  // 设置分组
  group: {
    type: DataTypes.STRING(50),
    defaultValue: 'general',
    comment: '设置分组：general, search, model 等'
  },
  // 设置描述
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '设置描述'
  }
}, {
  tableName: 'system_settings',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['key'], unique: true },
    { fields: ['group'] }
  ]
});

module.exports = SystemSetting;
