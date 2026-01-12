import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select,
  TreeSelect,
  Space, 
  Tag,
  message, 
  Popconfirm, 
  Typography,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  KeyOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  resetPassword,
  getDepartmentTree
} from '../api/user';

const { Title } = Typography;

/**
 * 员工管理页面
 */
const Employees = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [departments, setDepartments] = useState([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [page, pageSize]);

  /**
   * 获取用户列表
   */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, pageSize, keyword });
      if (res.code === 200) {
        setUsers(res.data.list);
        setTotal(res.data.pagination.total);
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取部门树
   */
  const fetchDepartments = async () => {
    try {
      const res = await getDepartmentTree();
      if (res.code === 200) {
        setDepartments(transformDeptTree(res.data));
      }
    } catch (error) {
      console.error('获取部门失败:', error);
    }
  };

  /**
   * 转换部门树格式
   */
  const transformDeptTree = (data) => {
    return data.map(item => ({
      value: item.id,
      title: item.name,
      children: item.children ? transformDeptTree(item.children) : []
    }));
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  /**
   * 打开新增/编辑弹窗
   */
  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        departmentId: user.departmentId,
        role: user.role,
        status: user.status
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ role: 'user', status: 1 });
    }
    setModalVisible(true);
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('更新成功');
      } else {
        await createUser(values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || '操作失败');
    }
  };

  /**
   * 删除用户
   */
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  /**
   * 重置密码
   */
  const handleResetPassword = async () => {
    try {
      const values = await pwdForm.validateFields();
      await resetPassword(resetUserId, values.password);
      message.success('密码重置成功');
      setPwdModalVisible(false);
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || '操作失败');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '用户',
      dataIndex: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <div>
            <div>{text}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.username}</div>
          </div>
        </Space>
      )
    },
    {
      title: '部门',
      dataIndex: ['department', 'name'],
      render: (text) => text || '-'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      render: (text) => text || '-'
    },
    {
      title: '手机',
      dataIndex: 'phone',
      render: (text) => text || '-'
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'purple' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      width: 200,
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
          <Button 
            type="link" 
            size="small" 
            icon={<KeyOutlined />}
            onClick={() => {
              setResetUserId(record.id);
              pwdForm.resetFields();
              setPwdModalVisible(true);
            }}
          >
            重置密码
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
        <Title level={4} style={{ margin: 0 }}>员工管理</Title>
        <Space>
          <Input.Search
            placeholder="搜索用户"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            新增员工
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); }
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingUser ? '编辑员工' : '新增员工'}
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
            name="username"
            label="用户名（钉钉工号）"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="departmentId" label="部门">
            <TreeSelect
              placeholder="请选择部门"
              treeData={departments}
              allowClear
            />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select
              options={[
                { value: 'user', label: '普通用户' },
                { value: 'admin', label: '管理员' }
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '禁用' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码弹窗 */}
      <Modal
        title="重置密码"
        open={pwdModalVisible}
        onOk={handleResetPassword}
        onCancel={() => setPwdModalVisible(false)}
        destroyOnClose
      >
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;
