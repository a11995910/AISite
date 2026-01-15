import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select,
  Space, 
  Tag,
  message, 
  Popconfirm, 
  Typography,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CloudServerOutlined
} from '@ant-design/icons';
import { 
  getProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider 
} from '../api/model';

const { Title } = Typography;

/**
 * 模型服务商管理页面
 */
const Providers = () => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await getProviders();
      if (res.code === 200) {
        setProviders(res.data);
      }
    } catch (error) {
      console.error(error);
      message.error('获取服务商列表失败');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (provider = null) => {
    setEditingProvider(provider);
    if (provider) {
      form.setFieldsValue({
        name: provider.name,
        apiType: provider.apiType,
        baseUrl: provider.baseUrl,
        apiKey: provider.apiKey,
        isActive: provider.isActive === 1
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ apiType: 'openai', isActive: true });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        isActive: values.isActive ? 1 : 0
      };
      
      if (editingProvider) {
        await updateProvider(editingProvider.id, data);
        message.success('更新成功');
      } else {
        await createProvider(data);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchProviders();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProvider(id);
      message.success('删除成功');
      fetchProviders();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const apiTypeMap = {
    openai: { text: 'OpenAI', color: 'green' },
    claude: { text: 'Claude', color: 'blue' },
    gemini: { text: 'Gemini', color: 'blue' },
    custom: { text: '自定义', color: 'default' }
  };

  const columns = [
    {
      title: '服务商名称',
      dataIndex: 'name',
      render: (text) => (
        <Space>
          <CloudServerOutlined />
          {text}
        </Space>
      )
    },
    {
      title: 'API类型',
      dataIndex: 'apiType',
      render: (type) => (
        <Tag color={apiTypeMap[type]?.color}>
          {apiTypeMap[type]?.text || type}
        </Tag>
      )
    },
    {
      title: 'API地址',
      dataIndex: 'baseUrl',
      ellipsis: true
    },
    {
      title: '模型数量',
      dataIndex: ['models'],
      render: (models) => models?.length || 0
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
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Space>
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
            description="删除后该服务商下的模型也会被删除"
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
        <Title level={4} style={{ margin: 0 }}>服务商管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新增服务商
        </Button>
      </div>

      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={providers}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingProvider ? '编辑服务商' : '新增服务商'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="name"
            label="服务商名称"
            rules={[{ required: true, message: '请输入服务商名称' }]}
          >
            <Input placeholder="如：OpenAI官方" />
          </Form.Item>
          <Form.Item
            name="apiType"
            label="API类型"
            rules={[{ required: true, message: '请选择API类型' }]}
          >
            <Select
              options={[
                { value: 'openai', label: 'OpenAI兼容' },
                { value: 'claude', label: 'Claude' },
                { value: 'gemini', label: 'Gemini' },
                { value: 'custom', label: '自定义' }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="baseUrl"
            label="API地址"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="如：https://api.openai.com" />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
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
    </div>
  );
};

export default Providers;
