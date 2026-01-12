import request from './request';

/**
 * 对话相关API
 */

/**
 * 获取对话列表
 */
export const getConversations = () => {
  return request.get('/chat/conversations');
};

/**
 * 创建新对话
 * @param {Object} data 对话信息
 * @param {string} data.title 标题
 * @param {number} data.agentId Agent ID（可选）
 */
export const createConversation = (data = {}) => {
  return request.post('/chat/conversations', data);
};

/**
 * 获取对话消息历史
 * @param {number} conversationId 对话ID
 */
export const getMessages = (conversationId) => {
  return request.get(`/chat/conversations/${conversationId}/messages`);
};

/**
 * 发送消息
 * @param {number} conversationId 对话ID
 * @param {Object} data 消息数据
 * @param {string} data.content 消息内容
 * @param {boolean} data.useWeb 是否联网
 * @param {Array} data.knowledgeBaseIds 知识库ID列表
 */
export const sendMessage = (conversationId, data) => {
  return request.post(`/chat/conversations/${conversationId}/messages`, data);
};

/**
 * 发送消息（流式响应）
 * @param {number} conversationId 对话ID
 * @param {Object} data 消息数据
 * @param {Function} onMessage 收到消息时的回调
 */
export const sendMessageStream = async (conversationId, data, onMessage) => {
  const token = localStorage.getItem('user-storage');
  let authToken = '';
  try {
    const parsed = JSON.parse(token);
    authToken = parsed?.state?.token || '';
  } catch {
    authToken = '';
  }

  const response = await fetch(`http://localhost:3001/api/chat/conversations/${conversationId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('请求失败');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(data);
          onMessage(parsed);
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
};

/**
 * 删除对话
 * @param {number} conversationId 对话ID
 */
export const deleteConversation = (conversationId) => {
  return request.delete(`/chat/conversations/${conversationId}`);
};

/**
 * 更新对话标题
 * @param {number} conversationId 对话ID
 * @param {string} title 新标题
 */
export const updateConversationTitle = (conversationId, title) => {
  return request.put(`/chat/conversations/${conversationId}`, { title });
};

/**
 * 获取可用的搜索引擎列表
 */
export const getAvailableSearchEngines = () => {
  return request.get('/settings/search-engines');
};

/**
 * 获取知识库列表（企业级）
 */
export const getKnowledgeBases = () => {
  return request.get('/knowledge-bases');
};

/**
 * 上传单个文件
 * @param {File} file 文件对象
 * @returns {Promise<Object>} 上传结果，包含解析的文本内容
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('user-storage');
  let authToken = '';
  try {
    const parsed = JSON.parse(token);
    authToken = parsed?.state?.token || '';
  } catch {
    authToken = '';
  }

  const response = await fetch('http://localhost:3001/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('文件上传失败');
  }

  return response.json();
};

/**
 * 上传多个文件
 * @param {File[]} files 文件数组
 * @returns {Promise<Object>} 上传结果
 */
export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const token = localStorage.getItem('user-storage');
  let authToken = '';
  try {
    const parsed = JSON.parse(token);
    authToken = parsed?.state?.token || '';
  } catch {
    authToken = '';
  }

  const response = await fetch('http://localhost:3001/api/upload/multiple', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('文件上传失败');
  }

  return response.json();
};
