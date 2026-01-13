import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import useUserStore from './stores/userStore';
import useThemeStore from './stores/themeStore';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ChatPage from './pages/Chat';
import './App.css';

/**
 * 路由守卫组件
 * 检查用户是否登录
 */
const PrivateRoute = ({ children }) => {
  const { token } = useUserStore();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * 主应用组件
 */
function App() {
  const { theme: currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          colorBgContainer: isDark ? '#131619' : '#ffffff',
          colorBgLayout: isDark ? '#0f1014' : '#f5f5f5',
        },
        components: {
          Layout: {
            bodyBg: isDark ? '#0f1014' : '#f5f5f5',
            headerBg: 'transparent',
            siderBg: isDark ? '#131619' : '#ffffff',
          },
          Input: {
            colorBgContainer: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
            colorBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#d9d9d9',
          },
          Button: {
            algorithm: true,
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* 登录页 */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 注册页 */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* 需要登录的页面 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* 默认跳转到对话页 */}
            <Route index element={<ChatPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:conversationId" element={<ChatPage />} />
          </Route>
          
          {/* 404跳转首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
