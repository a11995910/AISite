import request from './request';

/**
 * Agent API
 */

// 获取Agent列表
export const getAgents = (params) => request.get('/agents', { params });

// 获取单个Agent
export const getAgent = (id) => request.get(`/agents/${id}`);

// 创建Agent
export const createAgent = (data) => request.post('/agents', data);

// 更新Agent
export const updateAgent = (id, data) => request.put(`/agents/${id}`, data);

// 删除Agent
export const deleteAgent = (id) => request.delete(`/agents/${id}`);
