/**
 * 消息模型
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'conversation_id',
    comment: '对话ID'
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant', 'system'),
    allowNull: false,
    comment: '角色'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '消息内容'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

module.exports = Message;
