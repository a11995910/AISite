import { useEffect, useState } from 'react';
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Tag,
  message, 
  Popconfirm, 
  Empty,
  Upload,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  BookOutlined,
  FileOutlined,
  UploadOutlined,
  EyeOutlined,
  SettingOutlined,
  FileTextOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  getKnowledgeBases, 
  createKnowledgeBase, 
  updateKnowledgeBase, 
  deleteKnowledgeBase,
  getDocuments,
  uploadDocument,
  getDocumentContent,
  deleteDocument
} from '../api/knowledge';
import './Settings.css';

const { TextArea } = Input;

/**
 * 设置页面
 * 包含个人知识库管理功能
 */
const Settings = () => {
  // 知识库状态
  const [loading, setLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKb, setEditingKb] = useState(null);
  
  // 文档管理状态
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // 预览状态
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 文档状态映射
  const statusMap = {
    pending: { text: '待处理', className: 'status-pending' },
    processing: { text: '处理中', className: 'status-processing' },
    completed: { text: '已完成', className: 'status-completed' },
    failed: { text: '失败', className: 'status-failed' }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  /**
   * 获取个人知识库列表
   */
  const fetchKnowledgeBases = async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeBases({ type: 'personal' });
      if (res.code === 200) {
        setKnowledgeBases(res.data || []);
      }
    } catch (error) {
      console.error('获取知识库失败:', error);
      message.error('获取知识库失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开创建/编辑弹窗
   * @param {Object|null} kb - 要编辑的知识库，null表示新建
   */
  const openModal = (kb = null) => {
    setEditingKb(kb);
    if (kb) {
      form.setFieldsValue({
        name: kb.name,
        description: kb.description
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  /**
   * 提交创建/编辑表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        type: 'personal'
      };
      
      if (editingKb) {
        await updateKnowledgeBase(editingKb.id, data);
        message.success('更新成功');
      } else {
        await createKnowledgeBase(data);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchKnowledgeBases();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || '操作失败');
    }
  };

  /**
   * 删除知识库
   * @param {number} id - 知识库ID
   * @param {Event} e - 事件对象
   */
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteKnowledgeBase(id);
      message.success('删除成功');
      fetchKnowledgeBases();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  /**
   * 查看文档列表
   * @param {Object} kb - 知识库对象
   */
  const viewDocuments = async (kb) => {
    setEditingKb(kb);
    setDocModalVisible(true);
    await loadDocuments(kb.id);
  };

  /**
   * 加载文档列表
   * @param {number} kbId - 知识库ID
   */
  const loadDocuments = async (kbId) => {
    setDocLoading(true);
    try {
      const res = await getDocuments(kbId);
      if (res.code === 200) {
        setDocuments(res.data || []);
      }
    } catch (error) {
      console.error('获取文档失败:', error);
      message.error('获取文档失败');
    } finally {
      setDocLoading(false);
    }
  };

  /**
   * 上传文档
   * @param {Object} options - Upload组件的回调参数
   */
  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    if (!editingKb) {
      message.error('请先选择知识库');
      onError();
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadDocument(editingKb.id, formData);
      if (res.code === 200 || res.code === 201) {
        message.success('上传成功');
        onSuccess();
        await loadDocuments(editingKb.id);
        fetchKnowledgeBases();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error(error.message || '上传失败');
      onError();
    } finally {
      setUploadLoading(false);
    }
  };

  /**
   * 预览文档内容
   * @param {Object} doc - 文档对象
   */
  const handlePreview = async (doc) => {
    try {
      const res = await getDocumentContent(editingKb.id, doc.id);
      if (res.code === 200) {
        setPreviewFileName(doc.fileName);
        setPreviewContent(res.data.content || '无内容');
        setPreviewVisible(true);
      }
    } catch (error) {
      console.error('获取文档内容失败:', error);
      message.error('获取文档内容失败');
    }
  };

  /**
   * 删除文档
   * @param {number} docId - 文档ID
   */
  const handleDeleteDocument = async (docId) => {
    try {
      await deleteDocument(editingKb.id, docId);
      message.success('删除成功');
      await loadDocuments(editingKb.id);
      fetchKnowledgeBases();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="settings-page">
      {/* 页面头部 */}
      <div className="settings-header">
        <h1 className="settings-title">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            style={{ marginRight: 8, color: 'var(--text-secondary)' }}
          />
          <SettingOutlined />
          个人知识库
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新建知识库
        </Button>
      </div>

      {/* 知识库列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : knowledgeBases.length > 0 ? (
        <div className="knowledge-grid">
          {knowledgeBases.map(kb => (
            <div 
              key={kb.id} 
              className="kb-card"
              onClick={() => viewDocuments(kb)}
            >
              <div className="kb-card-header">
                <div className="kb-icon">
                  <BookOutlined />
                </div>
                <div className="kb-info">
                  <div className="kb-name">{kb.name}</div>
                  <div className="kb-desc">{kb.description || '暂无描述'}</div>
                </div>
              </div>
              <div className="kb-card-footer">
                <div className="kb-stats">
                  <div className="kb-stat">
                    <FileTextOutlined />
                    <span>{kb.documents?.length || 0} 个文档</span>
                  </div>
                </div>
                <div className="kb-actions">
                  <button 
                    className="kb-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(kb);
                    }}
                  >
                    <EditOutlined />
                  </button>
                  <Popconfirm
                    title="确定删除吗？"
                    description="删除后知识库中的文档也会被删除"
                    onConfirm={(e) => handleDelete(kb.id, e)}
                    onCancel={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="kb-action-btn danger"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DeleteOutlined />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
          
          {/* 添加卡片 */}
          <div 
            className="kb-card kb-card-add"
            onClick={() => openModal()}
          >
            <PlusOutlined />
            <span>创建新知识库</span>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无个人知识库"
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              创建第一个知识库
            </Button>
          </Empty>
        </div>
      )}

      {/* 新增/编辑知识库弹窗 */}
      <Modal
        title={editingKb ? '编辑知识库' : '新建知识库'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        className="settings-modal"
      >
        <Form 
          form={form} 
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea 
              rows={3} 
              placeholder="简单描述知识库的用途（可选）" 
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 文档管理弹窗 */}
      <Modal
        title={
          <Space>
            <BookOutlined style={{ color: 'var(--accent-primary)' }} />
            {editingKb?.name || ''} - 文档管理
          </Space>
        }
        open={docModalVisible}
        onCancel={() => setDocModalVisible(false)}
        footer={null}
        width={700}
        className="settings-modal"
      >
        {/* 上传区域 */}
        <div className="upload-area">
          <Upload
            customRequest={handleUpload}
            showUploadList={false}
            accept=".txt,.md,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json"
            disabled={uploadLoading}
          >
            <Button 
              icon={<UploadOutlined />} 
              loading={uploadLoading}
              type="primary"
              size="large"
            >
              {uploadLoading ? '上传中...' : '上传文档'}
            </Button>
          </Upload>
          <div className="upload-hint">
            支持格式：txt、md、pdf、doc、docx、xls、xlsx、csv、json（最大10MB）
          </div>
        </div>

        {/* 文档列表 */}
        <div className="doc-list">
          {docLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : documents.length > 0 ? (
            documents.map(doc => (
              <div key={doc.id} className="doc-item">
                <div className="doc-icon">
                  <FileOutlined />
                </div>
                <div className="doc-info">
                  <div className="doc-name">{doc.fileName}</div>
                  <div className="doc-meta">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <Tag className={`status-tag ${statusMap[doc.status]?.className}`}>
                      {statusMap[doc.status]?.text}
                    </Tag>
                  </div>
                </div>
                <div className="doc-actions">
                  <button 
                    className="kb-action-btn"
                    onClick={() => handlePreview(doc)}
                  >
                    <EyeOutlined />
                  </button>
                  <Popconfirm
                    title="确定删除此文档吗？"
                    onConfirm={() => handleDeleteDocument(doc.id)}
                  >
                    <button className="kb-action-btn danger">
                      <DeleteOutlined />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            ))
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无文档，请上传文档" 
            />
          )}
        </div>
      </Modal>

      {/* 文档预览弹窗 */}
      <Modal
        title={`预览：${previewFileName}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
        className="settings-modal"
      >
        <div className="preview-content">
          {previewContent}
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
