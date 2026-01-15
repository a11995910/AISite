import { Card, Typography, Space, Alert, Steps, Tabs, Button, message } from 'antd';
import {
  CodeOutlined,
  RocketOutlined,
  CopyOutlined,
  SettingOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { useState } from 'react';

const { Title, Paragraph, Text } = Typography;

/**
 * SDK 集成指南页面
 */
const SdkGuide = () => {
  const [activeTab, setActiveTab] = useState('web');

  const serverUrl = window.location.origin.replace('5174', '3001').replace('5173', '3001');

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success('代码已复制到剪贴板');
  };

  const scriptCode = `<!-- AI Assistant SDK -->
<script
  src="${serverUrl}/sdk/ai-sdk.js"
  data-server-url="${serverUrl}"
  data-position="right"
  data-primary-color="#7c3aed"
  data-auto-show="false"
></script>`;

  const advancedConfigCode = `<!-- 高级配置示例 -->
<script
  src="${serverUrl}/sdk/ai-sdk.js"
  data-server-url="${serverUrl}"

  <!-- 基础配置 -->
  data-position="right"        <!-- 悬浮球位置: right | left -->
  data-width="400px"           <!-- 侧边栏宽度 -->
  data-primary-color="#7c3aed" <!-- 主题色 -->
  data-z-index="99999"         <!-- 层级 -->

  <!-- 行为配置 -->
  data-auto-show="false"       <!-- 自动打开 -->
  data-enable-selection="true" <!-- 启用划词菜单 -->
  data-enable-form-fill="true" <!-- 启用表单填充 -->
  data-enable-history="true"   <!-- 启用历史记录 -->

  <!-- 认证配置 (可选) -->
  data-token="your-auth-token" <!-- 如果需要身份验证 -->
></script>`;

  const apiUsageCode = `// SDK加载完成后会自动挂载到 window.aiAssistant
// 也可以通过 window.aiAssistant 实例调用 API

// 1. 手动打开/关闭
window.aiAssistant.open();
window.aiAssistant.close();
window.aiAssistant.toggle();

// 2. 发送消息
window.aiAssistant.sendMessage("帮我总结一下这个页面的内容");

// 3. 填充表单
window.aiAssistant.fillForm([
  { name: 'username', value: '张三' },
  { label: '邮箱', value: 'zhangsan@example.com' }
]);

// 4. 清空历史
window.aiAssistant.clearHistory();`;

  return (
    <div className="sdk-guide-page">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* 页面标题 */}
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>
            <RocketOutlined style={{ marginRight: 12, color: '#7c3aed' }} />
            SDK 集成指南
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            将 AI 智能助手快速集成到您的业务系统中，支持 Web 网站、后台管理系统等多种场景。
          </Paragraph>
        </div>

        {/* 快速开始 */}
        <Card title="快速开始" className="modern-card">
          <Steps
            direction="vertical"
            items={[
              {
                title: '引入 SDK',
                description: (
                  <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                    <Text>将以下代码添加到 HTML 文件的 <Text code>&lt;body&gt;</Text> 标签结束之前：</Text>
                    <div className="code-block-wrapper">
                      <pre className="code-block">{scriptCode}</pre>
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        className="copy-btn"
                        onClick={() => copyCode(scriptCode)}
                      >
                        复制
                      </Button>
                    </div>
                  </Space>
                ),
                status: 'process',
                icon: <CodeOutlined />
              },
              {
                title: '验证安装',
                description: '刷新页面，您应该能在页面右下角看到 AI 助手的悬浮按钮。',
                status: 'wait',
                icon: <RocketOutlined />
              }
            ]}
          />
        </Card>

        {/* 详细配置 */}
        <Card title="配置与 API" className="modern-card">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'web',
                label: 'HTML 属性配置',
                icon: <SettingOutlined />,
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                      message="通过 script 标签的 data-* 属性进行配置，无需编写额外 JavaScript 代码。"
                      type="info"
                      showIcon
                    />
                    <div className="code-block-wrapper">
                      <pre className="code-block">{advancedConfigCode}</pre>
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        className="copy-btn"
                        onClick={() => copyCode(advancedConfigCode)}
                      >
                        复制
                      </Button>
                    </div>

                    <Title level={5} style={{ marginTop: 16 }}>配置项说明</Title>
                    <table className="config-table">
                      <thead>
                        <tr>
                          <th>属性 (data-*)</th>
                          <th>类型</th>
                          <th>默认值</th>
                          <th>说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>server-url</td>
                          <td>string</td>
                          <td>必填</td>
                          <td>后端服务地址 (例如: http://api.example.com)</td>
                        </tr>
                        <tr>
                          <td>position</td>
                          <td>string</td>
                          <td>right</td>
                          <td>悬浮球位置，可选 'left' 或 'right'</td>
                        </tr>
                        <tr>
                          <td>primary-color</td>
                          <td>string</td>
                          <td>#1677ff</td>
                          <td>主题色，建议与品牌色保持一致</td>
                        </tr>
                        <tr>
                          <td>auto-show</td>
                          <td>boolean</td>
                          <td>false</td>
                          <td>页面加载完成后是否自动打开侧边栏</td>
                        </tr>
                        <tr>
                          <td>enable-selection</td>
                          <td>boolean</td>
                          <td>true</td>
                          <td>是否启用划词快捷菜单</td>
                        </tr>
                      </tbody>
                    </table>
                  </Space>
                )
              },
              {
                key: 'api',
                label: 'JavaScript API',
                icon: <ApiOutlined />,
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                      message="SDK 初始化完成后，会挂载全局对象 window.aiAssistant，可用于编程式控制。"
                      type="success"
                      showIcon
                    />
                    <div className="code-block-wrapper">
                      <pre className="code-block">{apiUsageCode}</pre>
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        className="copy-btn"
                        onClick={() => copyCode(apiUsageCode)}
                      >
                        复制
                      </Button>
                    </div>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      </Space>

      <style>{`
        .code-block-wrapper {
          position: relative;
          background: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
        }
        .code-block {
          margin: 0;
          padding: 16px;
          color: #d4d4d4;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 13px;
          line-height: 1.5;
          overflow-x: auto;
        }
        .copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          color: rgba(255,255,255,0.6);
        }
        .copy-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }
        .config-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 14px;
        }
        .config-table th, .config-table td {
          border: 1px solid #f0f0f0;
          padding: 12px;
          text-align: left;
        }
        .config-table th {
          background: #fafafa;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default SdkGuide;
