import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Tag,
  message, 
  Popconfirm, 
  Typography,
  Switch,
  List,
  Empty,
  Upload,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  BookOutlined,
  FileOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
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

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * 知识库管理页面
 */
const Knowledge = () => {
  const [loading, setLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKb, setEditingKb] = useState(null);
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeBases({ type: 'enterprise' });
      if (res.code === 200) {
        setKnowledgeBases(res.data);
      }
    } catch (error) {
      console.error(error);
      message.error('获取知识库失败');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (kb = null) => {
    setEditingKb(kb);
    if (kb) {
      form.setFieldsValue({
        name: kb.name,
        description: kb.description,
        isActive: kb.isActive === 1
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        type: 'enterprise',
        isActive: values.isActive ? 1 : 0
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

  const handleDelete = async (id) => {
    try {
      await deleteKnowledgeBase(id);
      message.success('删除成功');
      fetchKnowledgeBases();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const viewDocuments = async (kb) => {
    setEditingKb(kb);
    setDocModalVisible(true);
    await loadDocuments(kb.id);
  };

  const loadDocuments = async (kbId) => {
    setDocLoading(true);
    try {
      const res = await getDocuments(kbId);
      if (res.code === 200) {
        setDocuments(res.data);
      }
    } catch (error) {
      console.error(error);
      message.error('获取文档失败');
    } finally {
      setDocLoading(false);
    }
  };

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
        // 刷新文档列表
        await loadDocuments(editingKb.id);
        // 刷新知识库列表（更新文档数）
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

  const handlePreview = async (doc) => {
    try {
      const res = await getDocumentContent(editingKb.id, doc.id);
      if (res.code === 200) {
        setPreviewFileName(doc.fileName);
        setPreviewContent(res.data.content || '无内容');
        setPreviewVisible(true);
      }
    } catch (error) {
      console.error(error);
      message.error('获取文档内容失败');
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await deleteDocument(editingKb.id, docId);
      message.success('删除成功');
      // 刷新文档列表
      await loadDocuments(editingKb.id);
      // 刷新知识库列表（更新文档数）
      fetchKnowledgeBases();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const statusMap = {
    pending: { text: '待处理', color: 'default' },
    processing: { text: '处理中', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
    failed: { text: '失败', color: 'error' }
  };

  const columns = [
    {
      title: '知识库名称',
      dataIndex: 'name',
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '文档数',
      dataIndex: 'documents',
      render: (docs) => docs?.length || 0
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      render: (status) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<FileOutlined />}
            onClick={() => viewDocuments(record)}
          >
            文档
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            description="删除后知识库中的文档也会被删除"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>知识库管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新增知识库
        </Button>
      </div>

      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={knowledgeBases}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingKb ? '编辑知识库' : '新增知识库'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
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
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="知识库描述" />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 文档列表弹窗 */}
      <Modal
        title={`${editingKb?.name || ''} - 文档管理`}
        open={docModalVisible}
        onCancel={() => setDocModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
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
            >
              {uploadLoading ? '上传中...' : '上传文档'}
            </Button>
          </Upload>
          <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            支持格式：txt、md、pdf、doc、docx、xls、xlsx、csv、json（最大10MB）
          </div>
        </div>

        {docLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : documents.length > 0 ? (
          <List
            dataSource={documents}
            renderItem={doc => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(doc)}
                  >
                    预览
                  </Button>,
                  <Popconfirm
                    title="确定删除此文档吗？"
                    onConfirm={() => handleDeleteDocument(doc.id)}
                  >
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<FileOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={doc.fileName}
                  description={
                    <Space>
                      <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                      <Tag color={statusMap[doc.status]?.color}>
                        {statusMap[doc.status]?.text}
                      </Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无文档，请上传文档" />
        )}
      </Modal>

      {/* 文档预览弹窗 */}
      <Modal
        title={`预览：${previewFileName}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ 
          maxHeight: '60vh', 
          overflow: 'auto',
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}>
          {previewContent}
        </div>
      </Modal>
    </div>
  );
};

export default Knowledge;
