/**
 * 对话模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID'
  },
  agentId: {
    type: DataTypes.INTEGER,
    field: 'agent_id',
    comment: 'Agent ID'
  },
  title: {
    type: DataTypes.STRING(200),
    defaultValue: '新对话',
    comment: '对话标题'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  underscored: true
});

module.exports = Conversation;
