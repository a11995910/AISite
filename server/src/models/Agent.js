/**
 * Agent预设模型
 * 管理AI助手的预设配置
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Agent = sequelize.define('agents', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Agent ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Agent名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '描述'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像URL'
  },
  systemPrompt: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'system_prompt',
    comment: '系统提示词'
  },
  modelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'model_id',
    comment: '默认模型ID'
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
    comment: '所有者ID（个人Agent）'
  },
  canEditFiles: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    field: 'can_edit_files',
    comment: '是否可编辑文件'
  },
  permissionMode: {
    type: DataTypes.ENUM('ask', 'auto'),
    defaultValue: 'ask',
    field: 'permission_mode',
    comment: '权限模式：ask询问 auto自动'
  },
  workDirectory: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'work_directory',
    comment: '工作目录'
  },
  isActive: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    field: 'is_active',
    comment: '是否启用'
  }
}, {
  tableName: 'agents',
  comment: 'Agent预设表'
});

module.exports = Agent;
