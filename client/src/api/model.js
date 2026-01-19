import request from './request';

/**
 * 模型相关 API
 */

/**
 * 获取用户可用的模型列表（根据权限过滤）
 * @param {string} type - 模型类型：chat/image，不传则返回两种类型
 * @returns {Promise<Object>} 模型列表
 */
export const getAvailableModels = (type) => {
  const params = type ? { type } : {};
  return request.get('/models/available', { params });
};

/**
 * 获取默认模型
 * @returns {Promise<Object>} 包含 chat 和 image 默认模型
 */
export const getDefaultModels = () => {
  return request.get('/models/defaults');
};
