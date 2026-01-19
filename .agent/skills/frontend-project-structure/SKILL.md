---
name: frontend-project-structure
description: 前端项目结构规范，包括目录组织、模块划分、i18n国际化、状态管理、API层封装等最佳实践。适用于 React/Vue 项目的架构设计和代码组织。
---

# 前端项目结构规范

为 React/Vue 前端项目提供标准化的目录结构、模块划分和代码组织规范，确保项目可维护性和可扩展性。

## 适用场景

- 新建前端项目时规划目录结构
- 重构现有前端项目的代码组织
- 实现国际化（i18n）多语言支持
- 规范 API 层和状态管理架构
- 制定团队前端开发规范

---

## 目录结构规范

### React 项目结构

```
src/
├── api/                    # API 请求层
│   ├── index.js           # API 统一导出
│   ├── request.js         # Axios 实例封装
│   ├── user.js            # 用户相关 API
│   ├── product.js         # 产品相关 API
│   └── ...
│
├── assets/                 # 静态资源
│   ├── images/            # 图片资源
│   ├── fonts/             # 字体文件
│   ├── icons/             # 图标文件
│   └── styles/            # 全局样式
│       ├── variables.css  # CSS 变量
│       ├── reset.css      # 样式重置
│       └── global.css     # 全局样式
│
├── components/             # 通用组件
│   ├── common/            # 基础组件（Button, Input, Modal 等）
│   │   ├── Button/
│   │   │   ├── index.jsx
│   │   │   ├── Button.module.css
│   │   │   └── Button.test.jsx
│   │   └── ...
│   ├── layout/            # 布局组件（Header, Footer, Sidebar 等）
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Sidebar/
│   └── business/          # 业务组件（与业务逻辑相关的复用组件）
│       ├── UserCard/
│       └── ProductList/
│
├── hooks/                  # 自定义 Hooks
│   ├── useAuth.js         # 认证相关 Hook
│   ├── useFetch.js        # 数据请求 Hook
│   ├── useLocalStorage.js # 本地存储 Hook
│   └── index.js           # 统一导出
│
├── i18n/                   # 国际化配置
│   ├── index.js           # i18n 初始化配置
│   ├── locales/           # 语言包目录
│   │   ├── zh-CN/         # 中文语言包
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   └── index.js
│   │   ├── en-US/         # 英文语言包
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   └── index.js
│   │   └── ...
│   └── utils.js           # i18n 工具函数
│
├── pages/                  # 页面组件
│   ├── Home/
│   │   ├── index.jsx
│   │   ├── Home.module.css
│   │   └── components/    # 页面私有组件
│   │       └── Banner.jsx
│   ├── User/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Profile.jsx
│   └── ...
│
├── router/                 # 路由配置
│   ├── index.jsx          # 路由主配置
│   ├── routes.js          # 路由表定义
│   └── guards.js          # 路由守卫
│
├── store/                  # 状态管理
│   ├── index.js           # Store 配置入口
│   ├── slices/            # Redux Toolkit slices（或 Zustand stores）
│   │   ├── userSlice.js
│   │   ├── appSlice.js
│   │   └── ...
│   └── selectors/         # 选择器
│       └── userSelectors.js
│
├── utils/                  # 工具函数
│   ├── index.js           # 统一导出
│   ├── format.js          # 格式化工具（日期、金额等）
│   ├── validate.js        # 验证工具
│   ├── storage.js         # 存储工具
│   ├── auth.js            # 认证工具
│   └── constants.js       # 常量定义
│
├── config/                 # 配置文件
│   ├── index.js           # 配置统一导出
│   ├── env.js             # 环境变量处理
│   └── theme.js           # 主题配置
│
├── App.jsx                 # 根组件
├── main.jsx               # 入口文件
└── index.css              # 入口样式
```

### Vue 项目结构

```
src/
├── api/                    # API 请求层（同 React）
├── assets/                 # 静态资源（同 React）
├── components/             # 组件目录
│   ├── common/            # 通用组件
│   ├── layout/            # 布局组件
│   └── business/          # 业务组件
│
├── composables/            # Vue 组合式函数（相当于 React hooks）
│   ├── useAuth.js
│   ├── useFetch.js
│   └── index.js
│
├── i18n/                   # 国际化配置（同 React）
├── views/                  # 页面视图（Vue 习惯用 views 而非 pages）
├── router/                 # 路由配置
├── store/                  # Pinia 状态管理
│   ├── index.js
│   └── modules/
│       ├── user.js
│       └── app.js
│
├── utils/                  # 工具函数
├── config/                 # 配置文件
├── directives/             # 自定义指令
├── plugins/                # Vue 插件
├── App.vue
└── main.js
```

---

## 模块划分原则

### 1. 按功能分层

```
表现层 (Presentation)
    └── pages/views、components
业务逻辑层 (Business Logic)
    └── hooks/composables、store
数据访问层 (Data Access)
    └── api/
基础设施层 (Infrastructure)
    └── utils/、config/
```

### 2. 组件分类标准

| 类型 | 说明 | 示例 |
|------|------|------|
| **基础组件** | 无业务逻辑，纯 UI | Button, Input, Modal |
| **布局组件** | 页面布局结构 | Header, Sidebar, Footer |
| **业务组件** | 包含业务逻辑，可复用 | UserCard, OrderList |
| **页面组件** | 路由对应的页面 | HomePage, LoginPage |
| **容器组件** | 负责数据获取，不含 UI | UserContainer |

### 3. 命名规范

```javascript
// 组件命名：PascalCase
UserProfile.jsx
ProductCard.vue

// 文件夹命名：PascalCase 或 kebab-case（团队统一即可）
UserProfile/
user-profile/

// 工具函数/hooks：camelCase
useAuth.js
formatDate.js

// 常量：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// CSS 类名：kebab-case 或 BEM
.user-card {}
.user-card__header {}
.user-card--active {}
```

---

## i18n 国际化规范

### 1. 目录结构

```
src/i18n/
├── index.js               # i18n 初始化和配置
├── utils.js               # i18n 工具函数
└── locales/               # 语言包目录
    ├── zh-CN/             # 中文（简体）
    │   ├── index.js       # 语言包导出
    │   ├── common.json    # 通用文案
    │   ├── auth.json      # 认证相关
    │   ├── user.json      # 用户模块
    │   ├── product.json   # 产品模块
    │   └── validation.json # 表单验证
    ├── en-US/             # 英文
    │   ├── index.js
    │   ├── common.json
    │   └── ...
    └── ja-JP/             # 日文
        └── ...
```

### 2. 语言包格式

按业务模块拆分，避免单文件过大：

```json
// locales/zh-CN/common.json
{
  "app": {
    "name": "应用名称",
    "slogan": "让生活更美好"
  },
  "action": {
    "confirm": "确定",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索",
    "reset": "重置",
    "submit": "提交",
    "back": "返回",
    "next": "下一步",
    "prev": "上一步"
  },
  "status": {
    "loading": "加载中...",
    "success": "操作成功",
    "error": "操作失败",
    "empty": "暂无数据"
  },
  "time": {
    "today": "今天",
    "yesterday": "昨天",
    "tomorrow": "明天",
    "justNow": "刚刚",
    "minutesAgo": "{n} 分钟前",
    "hoursAgo": "{n} 小时前",
    "daysAgo": "{n} 天前"
  }
}
```

```json
// locales/zh-CN/auth.json
{
  "login": {
    "title": "登录",
    "username": "用户名",
    "password": "密码",
    "rememberMe": "记住我",
    "forgotPassword": "忘记密码？",
    "noAccount": "没有账号？",
    "register": "立即注册",
    "submit": "登录",
    "success": "登录成功",
    "failed": "用户名或密码错误"
  },
  "register": {
    "title": "注册",
    "email": "邮箱",
    "confirmPassword": "确认密码",
    "agree": "我已阅读并同意",
    "terms": "服务条款",
    "submit": "注册",
    "success": "注册成功",
    "hasAccount": "已有账号？"
  },
  "logout": {
    "title": "退出登录",
    "confirm": "确定要退出登录吗？",
    "success": "已退出登录"
  }
}
```

```json
// locales/zh-CN/validation.json
{
  "required": "{field} 不能为空",
  "email": "请输入有效的邮箱地址",
  "min": "{field} 至少需要 {min} 个字符",
  "max": "{field} 最多 {max} 个字符",
  "between": "{field} 需要在 {min} 到 {max} 之间",
  "numeric": "{field} 必须是数字",
  "phone": "请输入有效的手机号码",
  "password": {
    "weak": "密码强度不足",
    "mismatch": "两次密码输入不一致"
  }
}
```

### 3. i18n 配置（React + react-i18next）

```javascript
// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言包
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

/**
 * i18n 初始化配置
 * 支持自动检测浏览器语言，本地存储语言偏好
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
    fallbackLng: 'zh-CN',           // 回退语言
    defaultNS: 'common',             // 默认命名空间
    ns: ['common', 'auth', 'user', 'validation'], // 所有命名空间
    
    interpolation: {
      escapeValue: false,            // React 已经处理了 XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18n_language',
    },
  });

export default i18n;

/**
 * 切换语言
 * @param {string} lang - 语言代码，如 'zh-CN', 'en-US'
 */
export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
};

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
export const getCurrentLanguage = () => i18n.language;

/**
 * 获取支持的语言列表
 * @returns {Array} 语言列表
 */
export const getSupportedLanguages = () => [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
];
```

### 4. 语言包导出

```javascript
// src/i18n/locales/zh-CN/index.js
import common from './common.json';
import auth from './auth.json';
import user from './user.json';
import validation from './validation.json';

export default {
  common,
  auth,
  user,
  validation,
};
```

### 5. 使用方式

```jsx
// React 组件中使用
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation('auth');
  
  return (
    <div>
      <h1>{t('login.title')}</h1>
      <input placeholder={t('login.username')} />
      <input placeholder={t('login.password')} type="password" />
      <button>{t('login.submit')}</button>
      
      {/* 使用插值 */}
      <p>{t('common:time.minutesAgo', { n: 5 })}</p>
      
      {/* 使用验证文案 */}
      <span className="error">
        {t('validation:required', { field: t('login.username') })}
      </span>
    </div>
  );
}
```

```jsx
// 语言切换组件
import { useTranslation } from 'react-i18next';
import { getSupportedLanguages, changeLanguage } from '@/i18n';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const languages = getSupportedLanguages();
  
  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### 6. i18n 最佳实践

#### ✅ 应该做

- **按业务模块拆分语言包**：避免单文件过大，便于维护
- **使用命名空间**：区分不同模块的文案
- **提供语境信息**：通过 key 名称表达语境
- **支持复数形式**：使用 i18next 的复数功能
- **配置回退语言**：确保找不到翻译时有兜底

```json
// 好的 key 命名
{
  "cart": {
    "item": "{{count}} 件商品",
    "item_plural": "{{count}} 件商品",
    "empty": "购物车为空",
    "checkout": "去结算"
  }
}
```

#### ❌ 不应该做

- **硬编码文案**：所有用户可见的文案都应该国际化
- **拼接翻译**：不同语言语序不同，避免字符串拼接
- **过度嵌套**：key 嵌套不超过 3 层
- **使用数字 key**：使用有意义的英文 key

```javascript
// ❌ 错误：拼接翻译
const message = t('hello') + name + t('welcome');

// ✅ 正确：使用插值
const message = t('helloWelcome', { name });
```

---

## API 层规范

### 1. Axios 实例封装

```javascript
// src/api/request.js
import axios from 'axios';
import { getToken, removeToken } from '@/utils/auth';
import { message } from 'antd'; // 或其他 UI 库

/**
 * 创建 Axios 实例
 * 统一处理请求/响应拦截、错误处理、token 注入
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 自动注入 token
 */
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 统一错误处理
 */
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    
    // 根据后端约定的数据结构处理
    if (data.code === 0 || data.success) {
      return data.data;
    }
    
    // 业务错误
    message.error(data.message || '请求失败');
    return Promise.reject(new Error(data.message));
  },
  (error) => {
    // HTTP 错误处理
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          message.error('登录已过期，请重新登录');
          removeToken();
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(response.data?.message || '请求失败');
      }
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请稍后重试');
    } else {
      message.error('网络错误，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default request;
```

### 2. API 模块示例

```javascript
// src/api/user.js
import request from './request';

/**
 * 用户相关 API
 */
export const userApi = {
  /**
   * 用户登录
   * @param {Object} data - 登录信息
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @returns {Promise<Object>} 用户信息和 token
   */
  login(data) {
    return request.post('/auth/login', data);
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} 用户信息
   */
  getCurrentUser() {
    return request.get('/user/current');
  },

  /**
   * 更新用户信息
   * @param {Object} data - 用户信息
   * @returns {Promise<Object>} 更新后的用户信息
   */
  updateUser(data) {
    return request.put('/user/profile', data);
  },

  /**
   * 获取用户列表（分页）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} [params.keyword] - 搜索关键词
   * @returns {Promise<Object>} 分页数据
   */
  getUsers(params) {
    return request.get('/users', { params });
  },
};
```

### 3. API 统一导出

```javascript
// src/api/index.js
export { userApi } from './user';
export { productApi } from './product';
export { orderApi } from './order';
// ... 其他 API 模块
```

---

## 状态管理规范

### Zustand 示例（推荐用于中小型项目）

```javascript
// src/store/userStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userApi } from '@/api';

/**
 * 用户状态管理
 * 使用 Zustand + persist 中间件实现持久化
 */
export const useUserStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      token: null,
      isLoggedIn: false,
      loading: false,

      // Actions
      /**
       * 登录
       * @param {Object} credentials - 登录凭证
       */
      login: async (credentials) => {
        set({ loading: true });
        try {
          const { user, token } = await userApi.login(credentials);
          set({ user, token, isLoggedIn: true, loading: false });
          return { success: true };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * 退出登录
       */
      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
      },

      /**
       * 更新用户信息
       * @param {Object} userData - 用户数据
       */
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
```

### 使用示例

```jsx
// 在组件中使用
import { useUserStore } from '@/store/userStore';

function UserProfile() {
  const { user, logout, loading } = useUserStore();
  
  if (loading) return <Loading />;
  
  return (
    <div>
      <h1>欢迎，{user?.name}</h1>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

---

## 文件命名规范总结

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile.jsx` |
| 页面 | PascalCase | `HomePage.jsx` |
| Hooks | camelCase + use 前缀 | `useAuth.js` |
| 工具函数 | camelCase | `formatDate.js` |
| 常量 | camelCase（文件）+ UPPER_CASE（变量）| `constants.js` |
| API 模块 | camelCase | `userApi.js` |
| 样式 | 与组件同名 + .module.css | `Button.module.css` |
| 语言包 | kebab-case | `zh-CN/common.json` |
| 测试 | 与源文件同名 + .test/.spec | `Button.test.jsx` |

---

## 最佳实践检查清单

### 项目结构
- [ ] 按功能分层（表现层、业务逻辑层、数据访问层）
- [ ] 组件按用途分类（common、layout、business）
- [ ] 页面私有组件放在页面目录下
- [ ] utils 目录有统一导出

### i18n
- [ ] 语言包按业务模块拆分
- [ ] 使用命名空间区分模块
- [ ] 配置语言自动检测
- [ ] 提供语言切换功能
- [ ] 所有用户可见文案已国际化

### API 层
- [ ] Axios 实例统一封装
- [ ] 请求拦截器自动注入 token
- [ ] 响应拦截器统一错误处理
- [ ] API 按模块拆分并统一导出

### 状态管理
- [ ] 状态按业务域拆分
- [ ] 敏感数据持久化加密
- [ ] 异步操作包含 loading 状态
- [ ] 提供清晰的 action 接口
