import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, RobotOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { login } from '../api/auth';
import useUserStore from '../stores/userStore';
import adminLoginBg from '../assets/admin_login_bg.png';
import './Login.css';

const { Title, Text } = Typography;

/**
 * 后台登录页面 (Redesigned)
 * 采用指挥中心(Command Center)风格
 */
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  /**
   * 处理登录
   */
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      if (res.code === 200) {
        setUser(res.data);
        message.success('验证通过，正在进入系统...');
        navigate('/dashboard');
      } else {
        message.error(res.message || '认证失败');
      }
    } catch (error) {
      message.error(error.message || '连接服务器失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* 左侧视觉区 */}
      <div className="admin-login-visual" style={{ backgroundImage: `url(${adminLoginBg})` }}>
        <div className="visual-overlay">
          <Space direction="vertical" size="large">
            <div className="system-icon-wrapper">
              <SafetyCertificateOutlined style={{ fontSize: 64, color: '#1677ff', marginBottom: 24 }} />
            </div>
            <div className="system-title">AI CONTROL CENTER</div>
            <div className="system-subtitle">企业级智能中枢管理系统</div>
          </Space>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="admin-login-form-wrapper">
        <div className="form-content">
          <div className="form-header">
            <Title level={2} className="admin-login-title">LOGIN</Title>
            <Text className="admin-login-desc">请输入管理员凭证以访问系统</Text>
          </div>

          <Form
            name="admin-login"
            onFinish={handleLogin}
            size="large"
            initialValues={{ username: '', password: '' }}
            className="login-form"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入管理员账号' }]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="管理员账号" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入安全密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined className="site-form-item-icon" />} 
                placeholder="安全密码" 
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 24, marginTop: 32 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                className="login-btn"
              >
                ACCESS SYSTEM
              </Button>
            </Form.Item>

            <div className="admin-footer">
              <Space>
                <RobotOutlined />
                <span>SECURED BY ENTERPRISE AI DEFENSE</span>
              </Space>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
