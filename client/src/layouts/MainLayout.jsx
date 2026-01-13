import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Avatar, Dropdown, message, Breadcrumb, Button } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  RobotOutlined,
  MessageOutlined,
  HomeOutlined,
  BulbOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import useUserStore from '../stores/userStore';
import useThemeStore from '../stores/themeStore';
import useChatStore from '../stores/chatStore';
import Sidebar from '../components/Sidebar';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

/**
 * 主布局组件
 * 包含侧边栏、顶部导航和内容区域
 */
const MainLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();
  const { reset: resetChat, currentAgent, currentConversationId, conversations } = useChatStore();
  const themeButtonRef = useRef(null);

  // 获取当前对话信息
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  // 同步主题到 document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 检查登录状态
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  /**
   * 处理登出
   */
  const handleLogout = () => {
    logout();
    resetChat();
    message.success('已退出登录');
    navigate('/login');
  };

  /**
   * 处理主题切换（带圆形扩散动画）
   */
  const handleThemeToggle = (e) => {
    e.preventDefault();

    // 获取点击位置
    const button = themeButtonRef.current;
    if (!button) {
      toggleTheme();
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // 计算最大半径（对角线距离）
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.background = theme === 'dark' ? '#f5f5f5' : '#0f1014';
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.style.transition = 'clip-path 0.6s ease-in-out';

    document.body.appendChild(overlay);

    // 触发动画
    requestAnimationFrame(() => {
      overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;
    });

    // 在动画中途切换主题
    setTimeout(() => {
      toggleTheme();
    }, 300);

    // 动画结束后移除遮罩
    setTimeout(() => {
      overlay.remove();
    }, 600);
  };

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => message.info('设置功能开发中')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  if (!user) return null;

  return (
    <Layout className="main-layout">
      {/* 侧边栏 */}
      <Sider 
        width={280} 
        className="main-sider"
      >
        <Sidebar />
      </Sider>

      <Layout>
        {/* 顶部导航 */}
        <Header className="main-header">
          <div className="header-left">
            <Breadcrumb
              className="header-breadcrumb"
              items={[
                {
                  title: (
                    <span className="breadcrumb-home">
                      <RobotOutlined /> 企业AI助手
                    </span>
                  )
                },
                // 如果有当前助手，显示助手名称
                ...(currentAgent || currentConversation?.agent ? [{
                  title: (
                    <span className="breadcrumb-agent">
                      <RobotOutlined /> {currentAgent?.name || currentConversation?.agent?.name}
                    </span>
                  )
                }] : []),
                // 如果有当前对话，显示对话标题
                ...(currentConversationId && currentConversation ? [{
                  title: (
                    <span className="breadcrumb-conversation">
                      <MessageOutlined /> {currentConversation.title || '新对话'}
                    </span>
                  )
                }] : [])
              ]}
            />
          </div>

          <div className="header-right">
            {/* 主题切换按钮 */}
            <Button
              ref={themeButtonRef}
              type="text"
              icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={handleThemeToggle}
              className="theme-toggle-btn"
              style={{ marginRight: '12px' }}
            />

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="user-info">
                <Avatar
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  size={32}
                />
                <span className="user-name">{user?.name || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
