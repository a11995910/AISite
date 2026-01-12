import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Typography } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  DingdingOutlined,
  TeamOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import * as authApi from '../api/auth';
import useUserStore from '../stores/userStore';
import registerBg from '../assets/register_bg.png';
import './Register.css';

const { Title, Text } = Typography;

/**
 * 注册页面 (重构版)
 * 采用左右分栏的Tech Blue风格
 */
const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  // 加载部门列表
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await authApi.getDepartments();
      if (res.data.code === 0) {
        setDepartments(res.data.data || []);
      }
    } catch (error) {
      console.error('加载部门失败:', error);
    }
  };

  /**
   * 处理注册提交
   */
  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        username: values.username,
        password: values.password,
        name: values.name,
        departmentId: values.departmentId,
        phone: values.phone,
        email: values.email
      });

      if (res.code === 200) {
        message.success('注册成功！');
        // 自动登录
        setUser({
          token: res.data.token,
          user: res.data.user
        });
        navigate('/');
      } else {
        message.error(res.data.message || '注册失败');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* 左侧展示区 */}
      <div className="register-visual" style={{ backgroundImage: `url(${registerBg})` }}>
        <div className="visual-overlay">
          <div className="brand-intro">
            <RobotOutlined className="brand-icon" />
            <h1 className="brand-title">Join Future</h1>
            <p className="brand-slogan">加入我们，共创智能未来</p>
          </div>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="register-form-wrapper">
        <div className="form-content">
          <div className="form-header">
            <Title level={2} style={{ marginBottom: 8, color: '#1f1f1f' }}>创建账号</Title>
            <Text type="secondary">填写以下信息以完成注册</Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            size="large"
            layout="vertical"
            className="register-form"
          >
            {/* 用户名 */}
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<DingdingOutlined className="site-form-item-icon" />}
                placeholder="用户名/钉钉工号"
              />
            </Form.Item>

            {/* 姓名 */}
            <Form.Item
              name="name"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input
                prefix={<IdcardOutlined className="site-form-item-icon" />}
                placeholder="真实姓名"
              />
            </Form.Item>

            {/* 部门选择 */}
            <Form.Item name="departmentId">
              <Select
                placeholder="所属部门"
                allowClear
                suffixIcon={<TeamOutlined />}
              >
                {departments.map(dept => (
                  <Select.Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 密码 */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="密码 (至少6位)"
              />
            </Form.Item>

            {/* 确认密码 */}
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="确认密码"
              />
            </Form.Item>

            {/* 手机号 */}
            <Form.Item
              name="phone"
              rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
            >
              <Input
                prefix={<PhoneOutlined className="site-form-item-icon" />}
                placeholder="手机号 (选填)"
              />
            </Form.Item>

            {/* 邮箱 */}
            <Form.Item
              name="email"
              rules={[{ type: 'email', message: '请输入正确的邮箱' }]}
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="邮箱 (选填)"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                立即注册
              </Button>
            </Form.Item>

            <div className="form-footer">
              <Text type="secondary">已有账号？</Text>
              <Link to="/login">立即登录</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
