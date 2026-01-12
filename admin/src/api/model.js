import request from './request';

/**
 * 模型服务商API
 */

// 获取服务商列表
export const getProviders = (params) => request.get('/providers', { params });

// 获取单个服务商
export const getProvider = (id) => request.get(`/providers/${id}`);

// 创建服务商
export const createProvider = (data) => request.post('/providers', data);

// 更新服务商
export const updateProvider = (id, data) => request.put(`/providers/${id}`, data);

// 删除服务商
export const deleteProvider = (id) => request.delete(`/providers/${id}`);

/**
 * 模型API
 */

// 获取模型列表
export const getModels = (params) => request.get('/models', { params });

// 获取默认模型
export const getDefaultModels = () => request.get('/models/defaults');

// 获取单个模型
export const getModel = (id) => request.get(`/models/${id}`);

// 创建模型
export const createModel = (data) => request.post('/models', data);

// 更新模型
export const updateModel = (id, data) => request.put(`/models/${id}`, data);

// 设为默认模型
export const setDefaultModel = (id) => request.put(`/models/${id}/default`);

// 删除模型
export const deleteModel = (id) => request.delete(`/models/${id}`);
