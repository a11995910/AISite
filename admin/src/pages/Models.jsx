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
  Switch,
  Tree,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  ApiOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { 
  getModels, 
  createModel, 
  updateModel, 
  deleteModel,
  setDefaultModel,
  getProviders
} from '../api/model';
import { getDepartmentTree } from '../api/user';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * 模型配置页面
 * 支持部门权限设置
 */
const Models = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [providers, setProviders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allDeptIds, setAllDeptIds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [restrictDepartments, setRestrictDepartments] = useState(false);
  const [selectedDeptKeys, setSelectedDeptKeys] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchModels();
    fetchProviders();
    fetchDepartments();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await getModels();
      if (res.code === 200) {
        setModels(res.data);
      }
    } catch (error) {
      console.error(error);
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

  /**
   * 获取部门树并提取所有部门ID
   */
  const fetchDepartments = async () => {
    try {
      const res = await getDepartmentTree();
      if (res.code === 200) {
        const treeData = transformDeptTree(res.data);
        setDepartments(treeData);
        
        // 提取所有部门ID用于默认全选
        const ids = extractAllIds(res.data);
        setAllDeptIds(ids);
      }
    } catch (error) {
      console.error('获取部门列表失败:', error);
    }
  };

  /**
   * 转换为 Tree 组件格式
   */
  const transformDeptTree = (data) => {
    return data.map(item => ({
      key: item.id,
      title: item.name,
      children: item.children ? transformDeptTree(item.children) : []
    }));
  };

  /**
   * 递归提取所有部门ID
   */
  const extractAllIds = (data) => {
    let ids = [];
    data.forEach(item => {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        ids = ids.concat(extractAllIds(item.children));
      }
    });
    return ids;
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
      // 设置权限状态
      setRestrictDepartments(model.restrictDepartments === 1);
      // 设置已选部门
      const deptIds = model.departments?.map(d => d.id) || [];
      setSelectedDeptKeys(deptIds);
    } else {
      form.resetFields();
      form.setFieldsValue({ type: 'chat', maxTokens: 4096, isActive: true });
      setRestrictDepartments(false);
      setSelectedDeptKeys([]);
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        isActive: values.isActive ? 1 : 0,
        restrictDepartments: restrictDepartments,
        departmentIds: restrictDepartments ? selectedDeptKeys : []
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

  /**
   * 限制部门开关变化
   */
  const handleRestrictChange = (checked) => {
    setRestrictDepartments(checked);
    // 开启限制时，默认全选所有部门
    if (checked && selectedDeptKeys.length === 0) {
      setSelectedDeptKeys([...allDeptIds]);
    }
  };

  /**
   * 部门树选择变化
   */
  const handleDeptCheck = (checkedKeys) => {
    setSelectedDeptKeys(checkedKeys);
  };

  const typeMap = {
    chat: { text: '对话', color: 'blue' },
    image: { text: '绘图', color: 'purple' },
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
      title: '权限',
      dataIndex: 'restrictDepartments',
      render: (restrict, record) => (
        restrict === 1 ? (
          <Tag color="orange" icon={<LockOutlined />}>
            限{record.departments?.length || 0}个部门
          </Tag>
        ) : (
          <Tag color="green" icon={<UnlockOutlined />}>
            全员可用
          </Tag>
        )
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
        width={600}
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

          {/* 权限设置部分 */}
          <Form.Item label="部门权限">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Switch 
                checked={restrictDepartments}
                onChange={handleRestrictChange}
              />
              <span style={{ color: restrictDepartments ? '#faad14' : '#52c41a' }}>
                {restrictDepartments ? '限制指定部门可用' : '所有人可用'}
              </span>
            </div>
            
            {restrictDepartments && (
              <>
                <Alert 
                  message="勾选允许使用此模型的部门"
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                />
                <div style={{ 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 6, 
                  padding: 12,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  <Tree
                    checkable
                    defaultExpandAll
                    checkedKeys={selectedDeptKeys}
                    onCheck={handleDeptCheck}
                    treeData={departments}
                  />
                </div>
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  已选择 {selectedDeptKeys.length} 个部门
                </div>
              </>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Models;
