import axios from 'axios';
import useUserStore from '../stores/userStore';

/**
 * Axios请求实例
 * 封装统一的请求配置和拦截器
 */
const request = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求拦截器
 * 自动添加Authorization头
 */
request.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 统一处理响应和错误
 */
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      // 401 未授权，跳转登录
      if (response.status === 401) {
        useUserStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }
      
      // 403 权限不足
      if (response.status === 403) {
        return Promise.reject(new Error('权限不足'));
      }
      
      // 其他错误
      const message = response.data?.message || '请求失败';
      return Promise.reject(new Error(message));
    }
    
    return Promise.reject(new Error('网络连接失败'));
  }
);

export default request;
