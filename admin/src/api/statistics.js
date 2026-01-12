import request from './request';

/**
 * 统计数据API
 */

// 获取概览数据
export const getOverview = () => request.get('/statistics/overview');

// 获取用量统计
export const getUsage = (params) => request.get('/statistics/usage', { params });

// 获取趋势数据
export const getTrends = (params) => request.get('/statistics/trends', { params });
