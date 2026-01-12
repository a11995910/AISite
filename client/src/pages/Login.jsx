import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, RobotOutlined } from '@ant-design/icons';
import { login } from '../api/auth';
import useUserStore from '../stores/userStore';
import loginBg from '../assets/login_bg.png';
import './Login.css';

const { Title, Text } = Typography;

/**
 * 登录页面 (重构版)
 * 采用左右分栏的Tech Blue风格
 */
const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);

  // 提交表单
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      if (res.code === 200) {
        message.success('登录成功');
        setUser({
          user: res.data.user,
          token: res.data.token
        });
        navigate('/');
      } else {
        message.error(res.message || '登录失败');
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error(error.message || '登录请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 左侧展示区 */}
      <div className="login-visual" style={{ backgroundImage: `url(${loginBg})` }}>
        <div className="visual-overlay">
          <div className="brand-intro">
            <RobotOutlined className="brand-icon" />
            <h1 className="brand-title">Enterprise AI</h1>
            <p className="brand-slogan">赋能企业智能化转型的专业平台</p>
          </div>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="login-form-wrapper">
        <div className="form-content">
          <div className="form-header">
            <Title level={2} style={{ marginBottom: 8, color: '#1f1f1f' }}>欢迎回来</Title>
            <Text type="secondary">请登录您的账号以继续使用</Text>
          </div>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="用户名" 
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="密码"
              />
            </Form.Item>
            
            <div className="form-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a className="login-form-forgot" onClick={() => message.info('请联系管理员重置密码')}>
                忘记密码
              </a>
            </div>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                立即登录
              </Button>
            </Form.Item>

            <div className="form-footer">
              <Text type="secondary">还没有账号？</Text>
              <Link to="/register">立即注册</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
