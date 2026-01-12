import axios from 'axios';

/**
 * Axios请求实例
 * 封装统一的请求配置和拦截器
 */
const request = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 60000, // 对话可能需要较长时间
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 获取token
 */
const getToken = () => {
  try {
    const stored = localStorage.getItem('user-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * 请求拦截器
 * 自动添加Authorization头
 */
request.interceptors.request.use(
  (config) => {
    const token = getToken();
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
        localStorage.removeItem('user-storage');
        window.location.href = '/login';
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }
      
      // 其他错误
      const message = response.data?.message || '请求失败';
      return Promise.reject(new Error(message));
    }
    
    return Promise.reject(new Error('网络连接失败'));
  }
);

export default request;
