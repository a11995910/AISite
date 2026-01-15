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
  Switch,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { 
  getAgents, 
  createAgent, 
  updateAgent, 
  deleteAgent 
} from '../api/agent';
import { getModels } from '../api/model';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Agent管理页面
 */
const Agents = () => {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [models, setModels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAgents();
    fetchModels();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await getAgents({ type: 'enterprise' });
      if (res.code === 200) {
        setAgents(res.data);
      }
    } catch (error) {
      console.error(error);
      message.error('获取Agent列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await getModels({ type: 'chat', isActive: 1 });
      if (res.code === 200) {
        setModels(res.data);
      }
    } catch (error) {
      console.error('获取模型失败:', error);
    }
  };

  const openModal = (agent = null) => {
    setEditingAgent(agent);
    if (agent) {
      form.setFieldsValue({
        name: agent.name,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        modelId: agent.modelId,
        canEditFiles: agent.canEditFiles === 1,
        permissionMode: agent.permissionMode,
        workDirectory: agent.workDirectory,
        isActive: agent.isActive === 1
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ 
        permissionMode: 'ask',
        canEditFiles: false,
        isActive: true 
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        type: 'enterprise',
        canEditFiles: values.canEditFiles ? 1 : 0,
        isActive: values.isActive ? 1 : 0
      };
      
      if (editingAgent) {
        await updateAgent(editingAgent.id, data);
        message.success('更新成功');
      } else {
        await createAgent(data);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchAgents();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAgent(id);
      message.success('删除成功');
      fetchAgents();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const columns = [
    {
      title: 'Agent',
      dataIndex: 'name',
      render: (text, record) => (
        <Space>
          <Avatar 
            icon={<RobotOutlined />} 
            src={record.avatar}
            style={{ backgroundColor: '#722ed1' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Paragraph 
              ellipsis={{ rows: 1 }} 
              style={{ margin: 0, color: '#999', fontSize: 12, maxWidth: 200 }}
            >
              {record.description || '暂无描述'}
            </Paragraph>
          </div>
        </Space>
      )
    },
    {
      title: '默认模型',
      dataIndex: ['model', 'name'],
      render: (text) => text || '-'
    },
    {
      title: '文件编辑',
      dataIndex: 'canEditFiles',
      render: (val) => (
        <Tag color={val === 1 ? 'blue' : 'default'}>
          {val === 1 ? '可编辑' : '不可编辑'}
        </Tag>
      )
    },
    {
      title: '权限模式',
      dataIndex: 'permissionMode',
      render: (mode) => (
        <Tag color={mode === 'auto' ? 'orange' : 'green'}>
          {mode === 'auto' ? '自动' : '询问'}
        </Tag>
      )
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

  // 监听canEditFiles变化
  const canEditFiles = Form.useWatch('canEditFiles', form);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Agent管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新增Agent
        </Button>
      </div>

      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={agents}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingAgent ? '编辑Agent' : '新增Agent'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="name"
            label="Agent名称"
            rules={[{ required: true, message: '请输入Agent名称' }]}
          >
            <Input placeholder="如：代码助手" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={2} placeholder="Agent描述" />
          </Form.Item>
          <Form.Item
            name="systemPrompt"
            label="系统提示词"
          >
            <TextArea 
              rows={4} 
              placeholder="定义Agent的角色和行为方式"
            />
          </Form.Item>
          <Form.Item
            name="modelId"
            label="默认模型"
          >
            <Select
              placeholder="请选择默认模型"
              allowClear
              options={models.map(m => ({ value: m.id, label: m.name }))}
            />
          </Form.Item>
          <Form.Item
            name="canEditFiles"
            label="是否可编辑文件"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          {canEditFiles && (
            <>
              <Form.Item
                name="permissionMode"
                label="权限模式"
              >
                <Select
                  options={[
                    { value: 'ask', label: '询问模式（每次编辑前询问）' },
                    { value: 'auto', label: '自动模式（自主编辑）' }
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="workDirectory"
                label="工作目录"
                extra="限制Agent只能在此目录下操作文件"
              >
                <Input placeholder="如：/home/user/project" />
              </Form.Item>
            </>
          )}
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

export default Agents;
