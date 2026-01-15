import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import useUserStore from './stores/userStore';

// 布局
import MainLayout from './layouts/MainLayout';

// 页面
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import Providers from './pages/Providers';
import Models from './pages/Models';
import Knowledge from './pages/Knowledge';
import Agents from './pages/Agents';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import SdkGuide from './pages/SdkGuide';

/**
 * 路由守卫组件
 * 检查用户是否已登录
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useUserStore();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * 应用主组件
 */
function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8
        }
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            {/* 登录页 */}
            <Route path="/login" element={<Login />} />

            {/* 后台管理页面（需要登录） */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* 默认跳转到仪表盘 */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* 用户管理 */}
              <Route path="users/departments" element={<Departments />} />
              <Route path="users/employees" element={<Employees />} />
              
              {/* 模型管理 */}
              <Route path="models/providers" element={<Providers />} />
              <Route path="models/list" element={<Models />} />
              
              {/* 知识库管理 */}
              <Route path="knowledge" element={<Knowledge />} />
              
              {/* Agent管理 */}
              <Route path="agents" element={<Agents />} />
              
              {/* 用量统计 */}
              <Route path="statistics" element={<Statistics />} />

              {/* SDK集成指南 */}
              <Route path="sdk-guide" element={<SdkGuide />} />

              {/* 系统设置 */}
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404 跳转到首页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
