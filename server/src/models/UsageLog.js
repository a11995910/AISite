/**
 * 用量统计模型
 * 记录用户的AI使用情况
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UsageLog = sequelize.define('usage_logs', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '日志ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID'
  },
  modelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'model_id',
    comment: '模型ID'
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'agent_id',
    comment: 'Agent ID'
  },
  type: {
    type: DataTypes.ENUM('chat', 'image'),
    allowNull: false,
    comment: '使用类型'
  },
  inputTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'input_tokens',
    comment: '输入token数'
  },
  outputTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'output_tokens',
    comment: '输出token数'
  },
  totalTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_tokens',
    comment: '总token数'
  }
}, {
  tableName: 'usage_logs',
  comment: '用量统计表',
  updatedAt: false // 日志表不需要更新时间
});

module.exports = UsageLog;
