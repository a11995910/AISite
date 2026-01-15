import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Button, 
  Avatar, 
  Dropdown, 
  theme,
  Space,
  Typography
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  ApiOutlined,
  RobotOutlined,
  BookOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  CloudServerOutlined,
  RocketOutlined
} from '@ant-design/icons';
import useUserStore from '../stores/userStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * 后台管理主布局
 * 包含侧边栏导航、顶部栏和内容区
 */
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();
  
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  // 菜单配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: '用户管理',
      children: [
        {
          key: '/users/departments',
          icon: <ApartmentOutlined />,
          label: '部门管理'
        },
        {
          key: '/users/employees',
          icon: <UserOutlined />,
          label: '员工管理'
        }
      ]
    },
    {
      key: 'models',
      icon: <ApiOutlined />,
      label: '模型管理',
      children: [
        {
          key: '/models/providers',
          icon: <CloudServerOutlined />,
          label: '服务商管理'
        },
        {
          key: '/models/list',
          icon: <ApiOutlined />,
          label: '模型配置'
        }
      ]
    },
    {
      key: '/knowledge',
      icon: <BookOutlined />,
      label: '知识库管理'
    },
    {
      key: '/agents',
      icon: <RobotOutlined />,
      label: 'Agent管理'
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '用量统计'
    },
    {
      key: '/sdk-guide',
      icon: <RocketOutlined />,
      label: 'SDK 集成'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true
    }
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/settings');
    }
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    return [location.pathname];
  };

  // 获取展开的菜单项
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/users')) return ['users'];
    if (path.startsWith('/models')) return ['models'];
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        {/* Logo */}
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <RobotOutlined style={{ fontSize: 28, color: '#1890ff' }} />
          {!collapsed && (
            <Text strong style={{ color: '#fff', marginLeft: 10, fontSize: 16 }}>
              AI 管理平台
            </Text>
          )}
        </div>

        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* 主内容区 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        {/* 顶部栏 */}
        <Header 
          style={{ 
            padding: '0 24px', 
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          {/* 折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 48, height: 48 }}
          />

          {/* 用户信息 */}
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Text>{user?.name || '管理员'}</Text>
            </Space>
          </Dropdown>
        </Header>

        {/* 内容区 */}
        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
