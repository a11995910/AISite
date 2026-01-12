import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select,
  InputNumber,
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
  StarOutlined,
  StarFilled,
  ApiOutlined
} from '@ant-design/icons';
import { 
  getModels, 
  createModel, 
  updateModel, 
  deleteModel,
  setDefaultModel,
  getProviders
} from '../api/model';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * 模型配置页面
 */
const Models = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [providers, setProviders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchModels();
    fetchProviders();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await getModels();
      if (res.code === 200) {
        setModels(res.data);
      }
    } catch (error) {
      message.error('获取模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await getProviders({ isActive: 1 });
      if (res.code === 200) {
        setProviders(res.data);
      }
    } catch (error) {
      console.error('获取服务商失败:', error);
    }
  };

  const openModal = (model = null) => {
    setEditingModel(model);
    if (model) {
      form.setFieldsValue({
        providerId: model.providerId,
        name: model.name,
        modelId: model.modelId,
        type: model.type,
        maxTokens: model.maxTokens,
        description: model.description,
        isActive: model.isActive === 1
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ type: 'chat', maxTokens: 4096, isActive: true });
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
      
      if (editingModel) {
        await updateModel(editingModel.id, data);
        message.success('更新成功');
      } else {
        await createModel(data);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchModels();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteModel(id);
      message.success('删除成功');
      fetchModels();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultModel(id);
      message.success('设置成功');
      fetchModels();
    } catch (error) {
      message.error(error.message || '设置失败');
    }
  };

  const typeMap = {
    chat: { text: '对话', color: 'blue' },
    image: { text: '绘图', color: 'blue' },
    embedding: { text: '向量', color: 'cyan' }
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      render: (text, record) => (
        <Space>
          <ApiOutlined />
          {text}
          {record.isDefault === 1 && (
            <Tag color="gold" icon={<StarFilled />}>默认</Tag>
          )}
        </Space>
      )
    },
    {
      title: '模型标识',
      dataIndex: 'modelId',
      render: (text) => <code>{text}</code>
    },
    {
      title: '服务商',
      dataIndex: ['provider', 'name']
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type) => (
        <Tag color={typeMap[type]?.color}>
          {typeMap[type]?.text || type}
        </Tag>
      )
    },
    {
      title: '最大Token',
      dataIndex: 'maxTokens',
      render: (val) => val?.toLocaleString()
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
      width: 220,
      render: (_, record) => (
        <Space>
          {record.isDefault !== 1 && (
            <Button 
              type="link" 
              size="small" 
              icon={<StarOutlined />}
              onClick={() => handleSetDefault(record.id)}
            >
              设为默认
            </Button>
          )}
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
        <Title level={4} style={{ margin: 0 }}>模型配置</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新增模型
        </Button>
      </div>

      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={models}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingModel ? '编辑模型' : '新增模型'}
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
            name="providerId"
            label="服务商"
            rules={[{ required: true, message: '请选择服务商' }]}
          >
            <Select
              placeholder="请选择服务商"
              options={providers.map(p => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="如：GPT-4" />
          </Form.Item>
          <Form.Item
            name="modelId"
            label="模型标识"
            rules={[{ required: true, message: '请输入模型标识' }]}
          >
            <Input placeholder="如：gpt-4" />
          </Form.Item>
          <Form.Item
            name="type"
            label="模型类型"
            rules={[{ required: true, message: '请选择模型类型' }]}
          >
            <Select
              options={[
                { value: 'chat', label: '对话模型' },
                { value: 'image', label: '绘图模型' },
                { value: 'embedding', label: '向量模型' }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="maxTokens"
            label="最大Token数"
          >
            <InputNumber min={512} max={1000000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="模型描述" />
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

export default Models;
