import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Divider,

  message,
  Space,
  Avatar,
  Tabs,
  Alert,
  Spin,
  Radio,
  Typography
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SaveOutlined,
  GlobalOutlined,
  ApiOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { changePassword } from '../api/auth';
import { getSettings, updateSettings } from '../api/settings';
import useUserStore from '../stores/userStore';

const { Title, Text, Paragraph } = Typography;

/**
 * 系统设置页面
 */
const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSaving, setSearchSaving] = useState(false);
  const { user } = useUserStore();
  const [pwdForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 加载搜索API配置
  useEffect(() => {
    loadSearchSettings();
  }, []);

  const loadSearchSettings = async () => {
    setSearchLoading(true);
    try {
      const res = await getSettings('search');
      if (res.code === 200 && res.data) {
        searchForm.setFieldsValue({
          tavily_api_key: res.data.tavily_api_key?.value || '',
          serper_api_key: res.data.serper_api_key?.value || '',
          bocha_api_key: res.data.bocha_api_key?.value || '',
          bing_api_key: res.data.bing_api_key?.value || '',
          search_provider: res.data.search_provider?.value || 'auto'
        });
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      const res = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      if (res.code === 200) {
        message.success('密码修改成功');
        pwdForm.resetFields();
      } else {
        message.error(res.message || '修改失败');
      }
    } catch (error) {
      message.error(error.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearchSettings = async (values) => {
    setSearchSaving(true);
    try {
      const settings = {
        tavily_api_key: { value: values.tavily_api_key || '', type: 'string', group: 'search', description: 'Tavily搜索API密钥' },
        serper_api_key: { value: values.serper_api_key || '', type: 'string', group: 'search', description: 'Serper(Google)搜索API密钥' },
        bocha_api_key: { value: values.bocha_api_key || '', type: 'string', group: 'search', description: '博查搜索API密钥' },
        bing_api_key: { value: values.bing_api_key || '', type: 'string', group: 'search', description: 'Bing搜索API密钥' },
        search_provider: { value: values.search_provider || 'auto', type: 'string', group: 'search', description: '默认搜索引擎提供商' }
      };

      const res = await updateSettings({ settings });
      if (res.code === 200) {
        message.success('搜索API配置已保存');
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error) {
      message.error(error.message || '保存失败');
    } finally {
      setSearchSaving(false);
    }
  };

  // 个人信息卡片
  const ProfileCard = (
    <Card style={{ marginBottom: 24, borderRadius: 12 }}>
      <Space size={20}>
        <Avatar
          size={80}
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        />
        <div>
          <Title level={4} style={{ margin: 0 }}>{user?.name || '管理员'}</Title>
          <Text type="secondary">{user?.username || '-'}</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">邮箱：</Text>
            <Text>{user?.email || '未设置'}</Text>
          </div>
          <div>
            <Text type="secondary">部门：</Text>
            <Text>{user?.department?.name || '未分配'}</Text>
          </div>
        </div>
      </Space>
    </Card>
  );

  // 修改密码卡片
  const PasswordCard = (
    <Card
      title={
        <Space>
          <LockOutlined />
          修改密码
        </Space>
      }
      style={{ borderRadius: 12 }}
    >
      <Form
        form={pwdForm}
        layout="vertical"
        onFinish={handleChangePassword}
        style={{ maxWidth: 400 }}
      >
        <Form.Item
          name="oldPassword"
          label="当前密码"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password placeholder="请输入当前密码" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6位' }
          ]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              }
            })
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
          >
            保存修改
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // 搜索API配置卡片
  const SearchApiCard = (
    <Card
      title={
        <Space>
          <GlobalOutlined />
          联网搜索API配置
        </Space>
      }
      style={{ borderRadius: 12 }}
    >
      <Alert
        message="配置联网搜索功能"
        description="配置以下任一搜索API后，用户端开启联网搜索时将使用真实的网络搜索结果。优先级：Tavily &gt; Serper &gt; 博查 &gt; Bing &gt; DuckDuckGo（免费但功能有限）"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />



      <Spin spinning={searchLoading}>
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSaveSearchSettings}
          style={{ maxWidth: 600 }}
          initialValues={{ search_provider: 'auto' }}
        >
          <Form.Item
            name="search_provider"
            label="🔍 默认搜索引擎"
            tooltip="选择用户端联网搜索时默认使用的搜索引擎"
          >
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="auto">自动 (按优先级)</Radio.Button>
              <Radio.Button value="tavily">Tavily</Radio.Button>
              <Radio.Button value="serper">Google</Radio.Button>
              <Radio.Button value="bocha">博查 (国内)</Radio.Button>
              <Radio.Button value="bing">Bing</Radio.Button>
              <Radio.Button value="duckduckgo">DuckDuckGo</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Divider style={{ margin: '16px 0' }} />
          <Form.Item
            name="tavily_api_key"
            label={
              <Space>
                <span>🤖 Tavily API Key</span>
                <Text type="secondary">（推荐，每月1000次免费）</Text>
              </Space>
            }
            extra={<a href="https://tavily.com" target="_blank" rel="noopener noreferrer">获取API Key →</a>}
          >
            <Input.Password placeholder="tvly-xxxxxxxx" />
          </Form.Item>

          <Form.Item
            name="serper_api_key"
            label={
              <Space>
                <span>🔍 Serper API Key (Google搜索)</span>
                <Text type="secondary">（每月2500次免费）</Text>
              </Space>
            }
            extra={<a href="https://serper.dev" target="_blank" rel="noopener noreferrer">获取API Key →</a>}
          >
            <Input.Password placeholder="请输入Serper API Key" />
          </Form.Item>

          <Form.Item
            name="bocha_api_key"
            label={
              <Space>
                <span>🇨🇳 博查 API Key (国内搜索)</span>
                <Text type="secondary">（国内服务，访问稳定）</Text>
              </Space>
            }
            extra={<a href="https://bochaai.com" target="_blank" rel="noopener noreferrer">获取API Key →</a>}
          >
            <Input.Password placeholder="请输入博查 API Key" />
          </Form.Item>

          <Form.Item
            name="bing_api_key"
            label={
              <Space>
                <span>🅱️ Bing Search API Key</span>
                <Text type="secondary">（Azure付费服务）</Text>
              </Space>
            }
            extra={<a href="https://azure.microsoft.com/zh-cn/services/cognitive-services/bing-web-search-api/" target="_blank" rel="noopener noreferrer">获取API Key →</a>}
          >
            <Input.Password placeholder="请输入Bing Search API Key" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={searchSaving}
              icon={<SaveOutlined />}
            >
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          个人信息
        </span>
      ),
      children: (
        <div>
          {ProfileCard}
          {PasswordCard}
        </div>
      )
    },
    {
      key: 'search',
      label: (
        <span>
          <GlobalOutlined />
          联网搜索
        </span>
      ),
      children: SearchApiCard
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>系统设置</Title>
      <Tabs items={tabItems} defaultActiveKey="profile" />
    </div>
  );
};

export default Settings;
