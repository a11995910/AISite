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
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  BookOutlined,
  FileOutlined
} from '@ant-design/icons';
import { 
  getKnowledgeBases, 
  createKnowledgeBase, 
  updateKnowledgeBase, 
  deleteKnowledgeBase,
  getDocuments
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
    setDocLoading(true);
    try {
      const res = await getDocuments(kb.id);
      if (res.code === 200) {
        setDocuments(res.data);
      }
    } catch (error) {
      message.error('获取文档失败');
    } finally {
      setDocLoading(false);
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
        title={`${editingKb?.name || ''} - 文档列表`}
        open={docModalVisible}
        onCancel={() => setDocModalVisible(false)}
        footer={null}
        width={600}
      >
        {docLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : documents.length > 0 ? (
          <List
            dataSource={documents}
            renderItem={doc => (
              <List.Item
                extra={
                  <Tag color={statusMap[doc.status]?.color}>
                    {statusMap[doc.status]?.text}
                  </Tag>
                }
              >
                <List.Item.Meta
                  avatar={<FileOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={doc.fileName}
                  description={`${(doc.fileSize / 1024).toFixed(2)} KB`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无文档" />
        )}
      </Modal>
    </div>
  );
};

export default Knowledge;
