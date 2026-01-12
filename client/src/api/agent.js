import request from './request';

/**
 * Agent相关API
 */

/**
 * 获取可用的Agent列表（企业级+个人）
 */
export const getAgents = () => {
  return request.get('/agents');
};

/**
 * 创建个人Agent
 * @param {Object} data Agent数据
 */
export const createPersonalAgent = (data) => {
  return request.post('/agents/personal', data);
};

/**
 * 删除个人Agent
 * @param {number} id Agent ID
 */
export const deleteAgent = (id) => {
  return request.delete(`/agents/${id}`);
};

/**
 * 一键生成Agent系统提示词
 * @param {Object} data { name, description }
 */
export const generateAgentPrompt = (data) => {
  return request.post('/agents/generate-prompt', data);
};

/**
 * 获取知识库列表
 */
export const getKnowledgeBases = () => {
  return request.get('/knowledge-bases');
};
