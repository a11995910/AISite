import request from './request';

/**
 * 认证相关API
 */

/**
 * 用户登录
 * @param {Object} data 登录信息
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 */
export const login = (data) => {
  return request.post('/auth/login', data);
};

/**
 * 用户注册
 * @param {Object} data 注册信息
 */
export const register = (data) => {
  return request.post('/auth/register', data);
};

/**
 * 获取当前用户信息
 */
export const getProfile = () => {
  return request.get('/auth/profile');
};

/**
 * 获取部门列表（用于注册时选择）
 */
export const getDepartments = () => {
  return request.get('/auth/departments');
};
