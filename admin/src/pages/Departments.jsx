import { useEffect, useState } from 'react';
import { 
  Card, 
  Tree, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  Space, 
  message, 
  Popconfirm, 
  Typography,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { 
  getDepartmentTree, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '../api/user';

const { Title } = Typography;

/**
 * 部门管理页面
 * 树状展示部门结构，支持增删改
 */
const Departments = () => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
  }, []);

  /**
   * 获取部门树
   */
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentTree();
      if (res.code === 200) {
        setTreeData(transformTreeData(res.data));
      }
    } catch (error) {
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 转换为Tree组件需要的格式
   */
  const transformTreeData = (data) => {
    return data.map(item => ({
      key: item.id,
      title: (
        <Space>
          <span>{item.name}</span>
          <span style={{ color: '#999', fontSize: 12 }}>
            ({item.users?.length || 0}人)
          </span>
        </Space>
      ),
      name: item.name,
      parentId: item.parentId,
      sortOrder: item.sortOrder,
      children: item.children ? transformTreeData(item.children) : []
    }));
  };

  /**
   * 打开新增/编辑弹窗
   */
  const openModal = (dept = null) => {
    setEditingDept(dept);
    if (dept) {
      form.setFieldsValue({
        name: dept.name,
        sortOrder: dept.sortOrder || 0
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        sortOrder: 0
      });
    }
    setModalVisible(true);
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingDept) {
        // 编辑
        await updateDepartment(editingDept.key, values);
        message.success('更新成功');
      } else {
        // 新增
        const data = {
          ...values,
          parentId: selectedDept?.key || null
        };
        await createDepartment(data);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchDepartments();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || '操作失败');
    }
  };

  /**
   * 删除部门
   */
  const handleDelete = async (dept) => {
    try {
      await deleteDepartment(dept.key);
      message.success('删除成功');
      fetchDepartments();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  /**
   * 自定义树节点标题
   */
  const renderTitle = (nodeData) => {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingRight: 8
      }}>
        <span>{nodeData.title}</span>
        <Space size="small" onClick={e => e.stopPropagation()}>
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => openModal(nodeData)}
          />
          <Popconfirm
            title="确定删除该部门吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(nodeData)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>部门管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          新增部门
        </Button>
      </div>

      <Card loading={loading}>
        {treeData.length > 0 ? (
          <Tree
            showLine
            showIcon
            icon={<ApartmentOutlined />}
            defaultExpandAll
            treeData={treeData}
            onSelect={(keys, { node }) => setSelectedDept(node)}
            titleRender={renderTitle}
            style={{ padding: 16 }}
          />
        ) : (
          <Empty description="暂无部门数据" />
        )}
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingDept ? '编辑部门' : '新增部门'}
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
          {!editingDept && selectedDept && (
            <Form.Item label="上级部门">
              <Input value={selectedDept.name} disabled />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item
            name="sortOrder"
            label="排序"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Departments;
