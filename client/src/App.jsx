import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import useUserStore from './stores/userStore';
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
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
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
