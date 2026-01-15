# AI Assistant SDK

可嵌入到任意系统的AI助手侧边栏SDK，支持读取页面内容并基于上下文进行智能问答。

## 功能特性

- 一行代码即可嵌入到任意网页
- 自动提取页面内容作为对话上下文
- 支持流式响应，实时显示AI回答
- 响应式设计，支持移动端
- 可自定义主题色、位置等配置
- 支持深色模式

## 快速开始

### 方式一：一行代码接入

在你的业务系统页面中添加以下代码：

```html
<script src="http://your-ai-server.com/sdk/ai-sdk.js"></script>
```

### 方式二：带配置接入

```html
<script
  src="http://your-ai-server.com/sdk/ai-sdk.js"
  data-server-url="http://your-ai-server.com:5173"
  data-position="right"
  data-primary-color="#1677ff"
></script>
```

### 方式三：编程式调用

```html
<script src="http://your-ai-server.com/sdk/ai-sdk.js" data-auto-init="false"></script>
<script>
  // 手动初始化
  const aiAssistant = new AIAssistant({
    serverUrl: 'http://your-ai-server.com:5173',
    position: 'right',
    width: '400px',
    primaryColor: '#1677ff',
    onReady: () => {
      console.log('AI助手已就绪');
    }
  });

  // 手动打开/关闭
  document.getElementById('ai-btn').onclick = () => {
    aiAssistant.toggle();
  };

  // 手动发送消息
  aiAssistant.sendMessage('帮我总结这个页面的内容');
</script>
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `serverUrl` | string | `http://localhost:5173` | AI服务地址 |
| `position` | string | `right` | 侧边栏位置，可选 `left` 或 `right` |
| `width` | string | `400px` | 侧边栏宽度 |
| `primaryColor` | string | `#1677ff` | 主题色 |
| `token` | string | - | 认证token（可选） |
| `autoShow` | boolean | `false` | 是否自动显示侧边栏 |
| `zIndex` | number | `99999` | z-index层级 |
| `onReady` | function | - | SDK就绪回调 |
| `onOpen` | function | - | 侧边栏打开回调 |
| `onClose` | function | - | 侧边栏关闭回调 |

## data-属性配置

可通过 script 标签的 data 属性进行配置：

- `data-server-url` - 服务地址
- `data-position` - 位置
- `data-width` - 宽度
- `data-primary-color` - 主题色
- `data-token` - 认证token
- `data-auto-show` - 是否自动显示（`true`/`false`）
- `data-auto-init` - 是否自动初始化（`true`/`false`）

## API 方法

```javascript
const ai = new AIAssistant(config);

// 打开侧边栏
ai.open();

// 关闭侧边栏
ai.close();

// 切换侧边栏
ai.toggle();

// 发送消息
ai.sendMessage('你好');

// 更新页面上下文
ai.updateContext();

// 销毁实例
ai.destroy();
```

## 页面内容提取

SDK 会自动提取以下页面信息：

- URL 和标题
- meta 描述和关键词
- 主要内容文本（优先提取 `<main>`、`<article>` 等语义化标签）
- 结构化数据（表格、表单等）
- 用户选中的文本

## 开发环境测试

1. 启动后端服务：
```bash
cd server && npm run dev
```

2. 启动前端服务：
```bash
cd client && npm run dev
```

3. 打开测试页面：
```bash
open sdk/demo.html
```

或直接在浏览器中打开 `sdk/demo.html` 文件。

## 目录结构

```
sdk/
├── src/
│   ├── index.js       # SDK入口
│   ├── styles.js      # 样式生成
│   ├── extractor.js   # 页面内容提取
│   └── messenger.js   # postMessage通信
├── dist/
│   └── ai-sdk.js      # 打包产物
├── demo.html          # 测试页面
├── package.json
├── vite.config.js
└── README.md
```

## 构建

```bash
cd sdk
npm install
npm run build
```

构建产物将输出到 `dist/ai-sdk.js`。

## 注意事项

1. **跨域问题**：确保 AI 服务器正确配置了 CORS
2. **iframe 安全**：嵌入页面需要与 AI 服务在同一协议下（都是 http 或都是 https）
3. **Content Security Policy**：如果业务系统有 CSP 限制，需要添加 AI 服务域名到白名单

## License

MIT
