import request from './request';

/**
 * 知识库API
 * 用于员工端个人知识库管理
 */

/**
 * 获取知识库列表
 * @param {Object} params - 查询参数
 * @param {string} params.type - 知识库类型 ('personal' | 'enterprise')
 * @returns {Promise} API响应
 */
export const getKnowledgeBases = (params) => request.get('/knowledge-bases', { params });

/**
 * 获取单个知识库
 * @param {number} id - 知识库ID
 * @returns {Promise} API响应
 */
export const getKnowledgeBase = (id) => request.get(`/knowledge-bases/${id}`);

/**
 * 创建知识库
 * @param {Object} data - 知识库数据
 * @param {string} data.name - 知识库名称
 * @param {string} data.description - 知识库描述
 * @param {string} data.type - 知识库类型 ('personal' | 'enterprise')
 * @returns {Promise} API响应
 */
export const createKnowledgeBase = (data) => request.post('/knowledge-bases', data);

/**
 * 更新知识库
 * @param {number} id - 知识库ID
 * @param {Object} data - 更新数据
 * @returns {Promise} API响应
 */
export const updateKnowledgeBase = (id, data) => request.put(`/knowledge-bases/${id}`, data);

/**
 * 删除知识库
 * @param {number} id - 知识库ID
 * @returns {Promise} API响应
 */
export const deleteKnowledgeBase = (id) => request.delete(`/knowledge-bases/${id}`);

/**
 * 获取知识库文档列表
 * @param {number} kbId - 知识库ID
 * @returns {Promise} API响应
 */
export const getDocuments = (kbId) => request.get(`/knowledge-bases/${kbId}/documents`);

/**
 * 上传文档到知识库
 * @param {number} kbId - 知识库ID
 * @param {FormData} formData - 包含文件的FormData
 * @returns {Promise} API响应
 */
export const uploadDocument = (kbId, formData) => request.post(`/knowledge-bases/${kbId}/documents`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

/**
 * 获取文档内容
 * @param {number} kbId - 知识库ID
 * @param {number} docId - 文档ID
 * @returns {Promise} API响应
 */
export const getDocumentContent = (kbId, docId) => request.get(`/knowledge-bases/${kbId}/documents/${docId}/content`);

/**
 * 删除文档
 * @param {number} kbId - 知识库ID
 * @param {number} docId - 文档ID
 * @returns {Promise} API响应
 */
export const deleteDocument = (kbId, docId) => request.delete(`/knowledge-bases/${kbId}/documents/${docId}`);
