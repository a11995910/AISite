import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Avatar, Dropdown, message, Breadcrumb } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  RobotOutlined,
  MessageOutlined,
  HomeOutlined
} from '@ant-design/icons';
import useUserStore from '../stores/userStore';
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
  const { reset: resetChat, currentAgent, currentConversationId, conversations } = useChatStore();

  // 获取当前对话信息
  const currentConversation = conversations.find(c => c.id === currentConversationId);

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
        theme="light"
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
