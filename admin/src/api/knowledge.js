import request from './request';

/**
 * 知识库API
 */

// 获取知识库列表
export const getKnowledgeBases = (params) => request.get('/knowledge-bases', { params });

// 获取单个知识库
export const getKnowledgeBase = (id) => request.get(`/knowledge-bases/${id}`);

// 创建知识库
export const createKnowledgeBase = (data) => request.post('/knowledge-bases', data);

// 更新知识库
export const updateKnowledgeBase = (id, data) => request.put(`/knowledge-bases/${id}`, data);

// 删除知识库
export const deleteKnowledgeBase = (id) => request.delete(`/knowledge-bases/${id}`);

// 获取知识库文档
export const getDocuments = (kbId) => request.get(`/knowledge-bases/${kbId}/documents`);

// 上传文档
export const uploadDocument = (kbId, formData) => request.post(`/knowledge-bases/${kbId}/documents`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// 获取文档内容
export const getDocumentContent = (kbId, docId) => request.get(`/knowledge-bases/${kbId}/documents/${docId}/content`);

// 删除文档
export const deleteDocument = (kbId, docId) => request.delete(`/knowledge-bases/${kbId}/documents/${docId}`);

