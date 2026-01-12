import { useEffect, useState } from 'react';
import { Button, Input, Tooltip, Badge, Empty, Spin, Popconfirm, message, Modal, Form } from 'antd';
import {
  PlusOutlined,
  MessageOutlined,
  RobotOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import useChatStore from '../stores/chatStore';
import { getConversations, createConversation, deleteConversation } from '../api/chat';
import { getAgents, createPersonalAgent, deleteAgent, generateAgentPrompt } from '../api/agent';
import './Sidebar.css';

const { TextArea } = Input;

/**
 * 侧边栏组件
 * 显示对话列表或Agent列表，支持切换
 */
const Sidebar = () => {
  const [agents, setAgents] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [form] = Form.useForm();
  const {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversation,
    addConversation,
    removeConversation,
    sidebarMode,
    setSidebarMode,
    setCurrentAgent,
    loading,
    setLoading
  } = useChatStore();

  // 加载数据
  useEffect(() => {
    loadData();
  }, [sidebarMode]);

  /**
   * 加载对话列表或Agent列表
   */
  const loadData = async () => {
    setLoading(true);
    try {
      if (sidebarMode === 'chat') {
        const res = await getConversations();
        if (res.code === 200) {
          setConversations(res.data || []);
        }
      } else {
        const res = await getAgents();
        if (res.code === 200) {
          setAgents(res.data || []);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建新对话
   */
  const handleNewChat = async () => {
    try {
      const res = await createConversation({ title: '新对话' });
      if (res.code === 200) {
        addConversation(res.data);
        setCurrentConversation(res.data.id);
      }
    } catch (error) {
      message.error('创建对话失败');
    }
  };

  /**
   * 选择对话
   */
  const handleSelectConversation = (id) => {
    setCurrentConversation(id);
  };

  /**
   * 删除对话
   */
  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      removeConversation(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  /**
   * 选择Agent - 创建带助手的新对话
   */
  const handleSelectAgent = async (agent) => {
    try {
      // 先设置当前助手
      setCurrentAgent(agent);
      // 创建带 agentId 的对话
      const res = await createConversation({
        title: '新对话',
        agentId: agent.id
      });
      if (res.code === 200) {
        // 将agent信息附加到对话数据
        const conversationWithAgent = {
          ...res.data,
          agent: agent
        };
        addConversation(conversationWithAgent);
        setCurrentConversation(res.data.id);
        // 切换到对话模式
        setSidebarMode('chat');
      }
    } catch (error) {
      message.error('创建对话失败');
      console.error('创建对话失败:', error);
    }
  };

  /**
   * 创建个人Agent
   */
  const handleCreateAgent = async (values) => {
    setCreateLoading(true);
    try {
      const res = await createPersonalAgent(values);
      if (res.code === 200 || res.code === 201) {
        message.success('助手创建成功');
        setCreateModalOpen(false);
        form.resetFields();
        // 刷新Agent列表
        loadData();
      } else {
        message.error(res.message || '创建失败');
      }
    } catch (error) {
      message.error('创建助手失败');
      console.error('创建助手失败:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  /**
   * 删除个人Agent
   */
  const handleDeleteAgent = async (agentId, e) => {
    e.stopPropagation();
    try {
      const res = await deleteAgent(agentId);
      if (res.code === 200) {
        message.success('删除成功');
        loadData();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除助手失败');
    }
  };

  /**
   * 一键生成系统提示词
   */
  const handleGeneratePrompt = async () => {
    const name = form.getFieldValue('name');
    const description = form.getFieldValue('description');

    if (!name) {
      message.warning('请先输入助手名称');
      return;
    }

    setGenerateLoading(true);
    try {
      const res = await generateAgentPrompt({ name, description });
      if (res.code === 200 && res.data?.prompt) {
        form.setFieldValue('systemPrompt', res.data.prompt);
        message.success('提示词生成成功');
      } else {
        message.error(res.message || '生成失败');
      }
    } catch (error) {
      message.error('生成提示词失败，请重试');
      console.error('生成提示词失败:', error);
    } finally {
      setGenerateLoading(false);
    }
  };

  // 过滤数据
  const filteredConversations = conversations.filter(c => 
    c.title?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const filteredAgents = agents.filter(a =>
    a.name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="sidebar">
      {/* 系统Logo和名称 */}
      <div className="sidebar-brand">
        <RobotOutlined className="brand-icon" />
        <span className="brand-name">企业AI助手</span>
      </div>

      {/* 新建对话按钮 */}
      <div className="sidebar-header">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="new-chat-btn"
          onClick={handleNewChat}
        >
          新建对话
        </Button>
      </div>

      {/* 模式切换标签 */}
      <div className="sidebar-tabs">
        <div 
          className={`sidebar-tab ${sidebarMode === 'chat' ? 'active' : ''}`}
          onClick={() => setSidebarMode('chat')}
        >
          <MessageOutlined /> 对话
        </div>
        <div 
          className={`sidebar-tab ${sidebarMode === 'agents' ? 'active' : ''}`}
          onClick={() => setSidebarMode('agents')}
        >
          <RobotOutlined /> 助手
        </div>
      </div>

      {/* 搜索框 */}
      <div className="sidebar-search">
        <Input
          placeholder="搜索..."
          prefix={<SearchOutlined className="search-icon" />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {/* 列表内容 */}
      <div className="sidebar-list">
        {loading ? (
          <div className="sidebar-loading">
            <Spin />
          </div>
        ) : sidebarMode === 'chat' ? (
          // 对话列表
          filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="conv-icon-wrapper">
                  {conv.agent ? (
                    <RobotOutlined className="conv-icon agent-icon" style={{ color: '#1677ff' }} />
                  ) : (
                    <MessageOutlined className="conv-icon" />
                  )}
                </div>
                <div className="conv-content">
                  <div className="conv-title-row">
                    <span className="conv-title">{conv.title}</span>
                    {conv.agent && (
                      <span className="agent-tag">
                        {conv.agent.name}
                      </span>
                    )}
                  </div>
                </div>
                <Popconfirm
                  title="确定删除这个对话吗？"
                  onConfirm={(e) => handleDeleteConversation(conv.id, e)}
                  okText="删除"
                  cancelText="取消"
                >
                  <DeleteOutlined 
                    className="conv-delete"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            ))
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无对话"
              className="sidebar-empty"
            />
          )
        ) : (
          // Agent列表
          <>
            {filteredAgents.length > 0 ? (
              filteredAgents.map(agent => (
                <div
                  key={agent.id}
                  className="agent-item"
                  onClick={() => handleSelectAgent(agent)}
                >
                  <div className="agent-avatar">
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={agent.name} />
                    ) : (
                      <RobotOutlined />
                    )}
                    {agent.type === 'enterprise' ? (
                      <Badge
                        className="enterprise-badge"
                        count="企业"
                        size="small"
                      />
                    ) : (
                      <Badge
                        className="personal-badge"
                        count={<UserOutlined style={{ fontSize: 10, color: '#fff' }} />}
                        size="small"
                      />
                    )}
                  </div>
                  <div className="agent-info">
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-desc">{agent.description}</div>
                  </div>
                  {agent.type === 'personal' && (
                    <Popconfirm
                      title="确定删除这个助手吗？"
                      onConfirm={(e) => handleDeleteAgent(agent.id, e)}
                      okText="删除"
                      cancelText="取消"
                    >
                      <DeleteOutlined
                        className="agent-delete"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  )}
                </div>
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无助手"
                className="sidebar-empty"
              />
            )}
            {/* 添加助手按钮 */}
            <div className="add-agent-btn" onClick={() => setCreateModalOpen(true)}>
              <PlusOutlined /> 添加个人助手
            </div>
          </>
        )}
      </div>

      {/* 创建个人助手Modal */}
      <Modal
        title="创建个人助手"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAgent}
        >
          <Form.Item
            name="name"
            label="助手名称"
            rules={[{ required: true, message: '请输入助手名称' }]}
          >
            <Input placeholder="给你的助手起个名字" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="description"
            label="简短描述"
          >
            <Input placeholder="简单描述助手的功能（可选）" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="systemPrompt"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>系统提示词</span>
                <Button
                  type="link"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  loading={generateLoading}
                  onClick={handleGeneratePrompt}
                  style={{ padding: 0, height: 'auto' }}
                >
                  一键生成
                </Button>
              </div>
            }
            extra="定义助手的角色、能力和行为方式"
          >
            <TextArea
              rows={6}
              placeholder="例如：你是一个专业的翻译助手，擅长中英文互译..."
              maxLength={2000}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setCreateModalOpen(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sidebar;
