/**
 * 系统设置API
 */

import request from './request';

/**
 * 获取设置
 * @param {string} group 设置分组
 */
export const getSettings = (group) => {
  return request.get('/settings', { params: { group } });
};

/**
 * 获取单个设置
 * @param {string} key 设置键名
 */
export const getSetting = (key) => {
  return request.get(`/settings/${key}`);
};

/**
 * 批量更新设置
 * @param {object} data 设置数据 { settings: { key: { value, type, group } } }
 */
export const updateSettings = (data) => {
  return request.put('/settings', data);
};

/**
 * 更新单个设置
 * @param {string} key 设置键名
 * @param {object} data 设置值
 */
export const updateSetting = (key, data) => {
  return request.put(`/settings/${key}`, data);
};

/**
 * 删除设置
 * @param {string} key 设置键名
 */
export const deleteSetting = (key) => {
  return request.delete(`/settings/${key}`);
};
