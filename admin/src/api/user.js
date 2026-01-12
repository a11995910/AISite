import request from './request';

/**
 * 部门管理API
 */

// 获取部门树
export const getDepartmentTree = () => request.get('/departments');

// 获取部门列表（平铺）
export const getDepartmentList = () => request.get('/departments/list');

// 创建部门
export const createDepartment = (data) => request.post('/departments', data);

// 更新部门
export const updateDepartment = (id, data) => request.put(`/departments/${id}`, data);

// 删除部门
export const deleteDepartment = (id) => request.delete(`/departments/${id}`);

/**
 * 用户管理API
 */

// 获取用户列表
export const getUsers = (params) => request.get('/users', { params });

// 获取单个用户
export const getUser = (id) => request.get(`/users/${id}`);

// 创建用户
export const createUser = (data) => request.post('/users', data);

// 更新用户
export const updateUser = (id, data) => request.put(`/users/${id}`, data);

// 删除用户
export const deleteUser = (id) => request.delete(`/users/${id}`);

// 重置密码
export const resetPassword = (id, password) => request.put(`/users/${id}/reset-password`, { password });
