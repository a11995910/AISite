/**
 * 模型关联配置
 * 统一管理所有模型的关联关系
 */

const User = require('./User');
const Department = require('./Department');
const ModelProvider = require('./ModelProvider');
const Model = require('./Model');
const ModelDepartment = require('./ModelDepartment');
const KnowledgeBase = require('./KnowledgeBase');
const KnowledgeDocument = require('./KnowledgeDocument');
const KnowledgeChunk = require('./KnowledgeChunk');
const Agent = require('./Agent');
const UsageLog = require('./UsageLog');
const SystemSetting = require('./SystemSetting');

const Conversation = require('./Conversation');
const Message = require('./Message');

// 用户与部门的关联
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });

// 模型与服务商的关联
Model.belongsTo(ModelProvider, { foreignKey: 'providerId', as: 'provider' });
ModelProvider.hasMany(Model, { foreignKey: 'providerId', as: 'models' });

// 模型与部门的多对多关联（权限控制）
Model.belongsToMany(Department, { 
  through: ModelDepartment, 
  foreignKey: 'modelId', 
  otherKey: 'departmentId',
  as: 'departments' 
});
Department.belongsToMany(Model, { 
  through: ModelDepartment, 
  foreignKey: 'departmentId', 
  otherKey: 'modelId',
  as: 'allowedModels' 
});

// 知识库文档与知识库的关联
KnowledgeDocument.belongsTo(KnowledgeBase, { foreignKey: 'knowledgeBaseId', as: 'knowledgeBase' });
KnowledgeBase.hasMany(KnowledgeDocument, { foreignKey: 'knowledgeBaseId', as: 'documents' });

// 知识库文本块关联
KnowledgeChunk.belongsTo(KnowledgeDocument, { foreignKey: 'documentId', as: 'document' });
KnowledgeDocument.hasMany(KnowledgeChunk, { foreignKey: 'documentId', as: 'chunks' });
KnowledgeChunk.belongsTo(KnowledgeBase, { foreignKey: 'knowledgeBaseId', as: 'knowledgeBase' });

// 知识库所有者关联
KnowledgeBase.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Agent与模型的关联
Agent.belongsTo(Model, { foreignKey: 'modelId', as: 'model' });
Agent.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// 对话关联
Conversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Conversation.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// 用量日志关联
UsageLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UsageLog.belongsTo(Model, { foreignKey: 'modelId', as: 'model' });
UsageLog.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

module.exports = {
  User,
  Department,
  ModelProvider,
  Model,
  ModelDepartment,
  KnowledgeBase,
  KnowledgeDocument,
  KnowledgeChunk,
  Agent,
  Conversation,
  Message,
  UsageLog,
  SystemSetting
};
