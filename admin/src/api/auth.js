import request from './request';

/**
 * 认证相关API
 */

/**
 * 用户登录
 * @param {Object} data 登录信息
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @returns {Promise}
 */
export const login = (data) => {
  return request.post('/auth/login', data);
};

/**
 * 用户登出
 * @returns {Promise}
 */
export const logout = () => {
  return request.post('/auth/logout');
};

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export const getProfile = () => {
  return request.get('/auth/profile');
};

/**
 * 修改密码
 * @param {Object} data 密码信息
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.newPassword 新密码
 * @returns {Promise}
 */
export const changePassword = (data) => {
  return request.put('/auth/password', data);
};
