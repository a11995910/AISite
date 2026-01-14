# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个企业级AI应用平台，采用前后端分离架构，包含三个独立的子项目：

- **server**: Node.js/Express 后端服务，提供RESTful API
- **client**: React + Vite 员工使用端，员工进行AI功能使用的平台
- **admin**: React + Vite 后台管理端，管理员工账号、知识库、模型等系统配置

## 技术栈

### 后端 (server)
- **框架**: Express.js
- **ORM**: Sequelize
- **数据库**: MySQL
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **文件上传**: multer
- **文档处理**: pdf-parse, mammoth, xlsx

### 前端 (client & admin)
- **框架**: React 19
- **构建工具**: Vite
- **UI库**: Ant Design
- **路由**: React Router v7
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **图表**: ECharts (仅admin)
- **Markdown渲染**: react-markdown (仅client)

## 常用开发命令

### 后端服务 (server)
```bash
cd server
npm install              # 安装依赖
npm run dev              # 开发模式启动（使用nodemon热重载）
npm start                # 生产模式启动
npm run db:init          # 初始化数据库
npm test                 # 运行测试
```

### 员工使用端 (client)
```bash
cd client
npm install              # 安装依赖
npm run dev              # 开发服务器（端口: 5173）
npm run build            # 生产构建
npm run preview          # 预览生产构建
npm run lint             # 代码检查
```

### 后台管理端 (admin)
```bash
cd admin
npm install              # 安装依赖
npm run dev              # 开发服务器（端口: 5174）
npm run build            # 生产构建
npm run preview          # 预览生产构建
npm run lint             # 代码检查
```

## 项目架构

### 后端架构 (server/src)

```
src/
├── app.js                    # Express应用入口
├── config/                   # 配置文件
│   ├── database.js          # Sequelize数据库配置
│   └── jwt.js               # JWT配置
├── models/                   # Sequelize模型定义
│   ├── index.js             # 模型关联配置（重要！）
│   ├── User.js              # 用户模型
│   ├── Department.js        # 部门模型
│   ├── ModelProvider.js     # 模型服务商
│   ├── Model.js             # AI模型
│   ├── KnowledgeBase.js     # 知识库
│   ├── KnowledgeDocument.js # 知识库文档
│   ├── Agent.js             # AI助手
│   ├── Conversation.js      # 对话
│   ├── Message.js           # 消息
│   ├── UsageLog.js          # 用量日志
│   └── SystemSetting.js     # 系统设置
├── controllers/              # 控制器（业务逻辑）
├── routes/                   # 路由定义
│   └── index.js             # 路由汇总
├── middlewares/              # 中间件
│   ├── auth.js              # JWT认证中间件
│   └── errorHandler.js      # 错误处理
├── services/                 # 服务层（可选）
├── utils/                    # 工具函数
│   └── response.js          # 统一响应格式
└── scripts/
    └── initDatabase.js      # 数据库初始化脚本
```

**关键架构点**：
- **模型关联**: 所有Sequelize模型的关联关系在 `models/index.js` 中集中管理
- **认证流程**: JWT中间件在 `/api` 路由前应用，`/api/auth` 路由除外
- **数据库**: 使用Sequelize ORM，开发环境启动时自动同步模型
- **CORS**: 允许来自 localhost:5173, 5174, 5175, 3000 的请求

### 前端架构

**Client (员工使用端)**:
```
src/
├── App.jsx                  # 主应用组件（路由配置、主题配置）
├── main.jsx                 # 应用入口
├── api/                     # API请求封装
│   ├── request.js          # Axios实例配置
│   ├── auth.js             # 认证相关API
│   ├── chat.js             # 对话相关API
│   └── agent.js            # Agent相关API
├── stores/                  # Zustand状态管理
│   ├── userStore.js        # 用户状态
│   ├── chatStore.js        # 对话状态
│   └── themeStore.js       # 主题状态（支持深色模式）
├── layouts/                 # 布局组件
│   └── MainLayout.jsx      # 主布局
├── pages/                   # 页面组件
│   ├── Login.jsx           # 登录页
│   ├── Register.jsx        # 注册页
│   └── Chat.jsx            # 对话页
└── components/              # 通用组件
    ├── Sidebar.jsx         # 侧边栏（聊天记录/Agent列表）
    ├── ChatInput.jsx       # 输入框
    └── ChatMessage.jsx     # 消息显示
```

**Admin (后台管理端)**:
```
src/
├── App.jsx                  # 主应用组件（路由配置）
├── main.jsx                 # 应用入口
├── api/                     # API请求封装
│   ├── request.js          # Axios实例配置
│   ├── auth.js             # 认证
│   ├── user.js             # 用户管理
│   ├── model.js            # 模型管理
│   ├── knowledge.js        # 知识库管理
│   ├── agent.js            # Agent管理
│   ├── statistics.js       # 统计数据
│   └── settings.js         # 系统设置
├── stores/                  # Zustand状态管理
│   └── userStore.js        # 用户状态
├── layouts/                 # 布局组件
│   └── MainLayout.jsx      # 主布局（侧边栏导航）
└── pages/                   # 页面组件
    ├── Login.jsx           # 登录页
    ├── Dashboard.jsx       # 仪表盘
    ├── Departments.jsx     # 部门管理
    ├── Employees.jsx       # 员工管理
    ├── Providers.jsx       # 模型服务商管理
    ├── Models.jsx          # 模型管理
    ├── Knowledge.jsx       # 知识库管理
    ├── Agents.jsx          # Agent预设管理
    ├── Statistics.jsx      # 用量统计
    └── Settings.jsx        # 系统设置
```

## 环境配置

### 后端环境变量 (server/.env)

必须配置以下环境变量：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Wangjun@123
DB_NAME=ai_platform

# JWT配置
JWT_SECRET=ai-platform-jwt-secret-key-2026
JWT_EXPIRES_IN=7d

# 服务配置
PORT=3001
NODE_ENV=development
```

### 前端API配置

- Client默认连接: `http://localhost:3001/api`
- Admin默认连接: `http://localhost:3001/api`
- API配置在各自的 `src/api/request.js` 中

## 数据库模型关系

核心模型及其关联关系：

- **User** ↔ **Department**: 用户属于部门
- **Model** ↔ **ModelProvider**: 模型属于服务商
- **KnowledgeDocument** ↔ **KnowledgeBase**: 文档属于知识库
- **KnowledgeBase** ↔ **User**: 知识库有所有者
- **Agent** ↔ **Model**: Agent使用特定模型
- **Agent** ↔ **User**: Agent有所有者
- **Conversation** ↔ **User**: 对话属于用户
- **Conversation** ↔ **Agent**: 对话使用Agent
- **Message** ↔ **Conversation**: 消息属于对话
- **UsageLog** ↔ **User/Model/Agent**: 用量日志关联用户、模型、Agent

## 开发注意事项

1. **数据库初始化**: 首次运行需要执行 `npm run db:init` 初始化数据库表结构
2. **端口分配**:
   - 后端: 3001
   - Client: 5173
   - Admin: 5174
3. **认证机制**: 使用JWT，token存储在前端localStorage，通过Zustand管理
4. **CORS配置**: 后端已配置允许本地开发端口的跨域请求
5. **文件上传**: 上传的文件存储在 `server/uploads/` 目录
6. **深色模式**: Client支持深色/浅色主题切换（通过themeStore管理）
7. **模型关联**: 修改模型时务必检查 `server/src/models/index.js` 中的关联配置

## API路由结构

所有API路由前缀为 `/api`，主要路由：

- `/api/auth` - 认证相关（登录、注册）
- `/api/users` - 用户管理
- `/api/departments` - 部门管理
- `/api/providers` - 模型服务商管理
- `/api/models` - AI模型管理
- `/api/knowledge-bases` - 知识库管理
- `/api/agents` - Agent助手管理
- `/api/chat` - 对话功能
- `/api/statistics` - 用量统计
- `/api/settings` - 系统设置
- `/api/upload` - 文件上传
- `/api/health` - 健康检查

## 启动完整开发环境

```bash
# 1. 启动后端（终端1）
cd server && npm run dev

# 2. 启动员工使用端（终端2）
cd client && npm run dev

# 3. 启动后台管理端（终端3）
cd admin && npm run dev
```

然后访问：
- 员工使用端: http://localhost:5173
- 后台管理端: http://localhost:5174
- 后端API: http://localhost:3001/api
