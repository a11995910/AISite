/**
 * AI Assistant 嵌入式聊天界面
 * 精致简约风格 - 用于SDK iframe嵌入
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Input, Button, ConfigProvider, theme } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import ChatMessage from '../components/ChatMessage';
import './EmbedChat.css';

/**
 * 功能卡片数据 - 展示SDK特色功能
 */
const FEATURE_CARDS = [
  {
    icon: '✨',
    title: '划词提问',
    desc: '选中页面文字，快速询问AI',
    prompt: null,
    tip: '选中任意文字试试'
  },
  {
    icon: '📝',
    title: '表单助填',
    desc: 'AI帮你智能填写表单',
    prompt: '请帮我分析页面上的表单，并给出填写建议'
  },
  {
    icon: '📊',
    title: '页面分析',
    desc: '深度解读当前页面内容',
    prompt: '请详细分析这个页面的内容和结构'
  },
  {
    icon: '💬',
    title: '智能对话',
    desc: '基于上下文自由问答',
    prompt: null,
    tip: '直接输入问题即可'
  }
];

/**
 * 快捷操作按钮
 */
const QUICK_ACTIONS = [
  { icon: '📋', label: '总结要点', prompt: '请总结这个页面的关键要点' },
  { icon: '🔍', label: '查找信息', prompt: '请帮我在页面中查找关键信息' },
  { icon: '🌐', label: '翻译内容', prompt: '请将页面主要内容翻译成英文' }
];

const EmbedChat = () => {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [pageContext, setPageContext] = useState(null);
  const [token, setToken] = useState('');
  const [modelInfo, setModelInfo] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // 强制设置浅色模式并获取配置
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');

    // 获取配置
    const fetchConfig = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/chat/embed/config');
        if (res.ok) {
          const data = await res.json();
          if (data.code === 200 && data.data?.modelInfo) {
            setModelInfo(data.data.modelInfo);
          }
        }
      } catch (e) {
        console.error('获取配置失败:', e);
      }
    };

    fetchConfig();

    return () => {
      // 离开时恢复
      document.documentElement.removeAttribute('data-theme');
    };
  }, []);

  /**
   * 更新最后一条消息
   */
  const updateLastMessage = useCallback((content, extra = {}) => {
    setMessages(prev => {
      const arr = [...prev];
      if (arr.length > 0) {
        arr[arr.length - 1] = { ...arr[arr.length - 1], content, ...extra };
      }
      return arr;
    });
  }, []);

  /**
   * 向父窗口发送消息
   */
  const notifyParent = (type, data) => {
    window.parent.postMessage({ type, data }, '*');
  };

  /**
   * 监听父窗口消息
   */
  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data } = event.data || {};
      if (type === 'PAGE_CONTEXT') {
        setPageContext(data);
        if (data.token) setToken(data.token);
      } else if (type === 'SEND_MESSAGE' && data?.content) {
        handleSend(data.content);
      } else if (type === 'LOAD_HISTORY' && data?.messages) {
        if (data.messages.length > 0) {
          setMessages(data.messages);
          setShowWelcome(false);
        }
      } else if (type === 'HISTORY_CLEARED') {
        setMessages([]);
        setShowWelcome(true);
      }
    };

    window.addEventListener('message', handleMessage);
    notifyParent('READY', {});
    notifyParent('REQUEST_PAGE_CONTEXT', {});

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /**
   * 自动滚动到底部
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  /**
   * 发送消息
   */
  const handleSend = async (content) => {
    if (!content?.trim() || sending) return;

    const userContent = content.trim();
    setInputValue('');
    setShowWelcome(false);

    // 添加用户消息和AI占位消息
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userContent,
      createdAt: new Date().toISOString()
    };
    const assistantMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setSending(true);
    setStreamingContent('');

    try {
      // 构建带上下文的消息
      let finalContent = userContent;
      if (pageContext) {
        finalContent = `[页面上下文]
URL: ${pageContext.url || ''}
标题: ${pageContext.title || ''}
页面内容摘要:
${pageContext.content?.slice(0, 5000) || '无'}

[用户问题]
${userContent}`;
      }

      const response = await fetch('http://localhost:3001/api/chat/embed/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ content: finalContent, pageContext })
      });

      if (!response.ok) throw new Error('请求失败');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const d = line.slice(6);
            if (d.includes('DONE')) continue;
            try {
              const parsed = JSON.parse(d);
              if (parsed.modelInfo) {
                setModelInfo(parsed.modelInfo);
              }
              if (parsed.content) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              }
              if (parsed.suggestions) {
                updateLastMessage(fullContent, { suggestions: parsed.suggestions });
              }
            } catch {}
          }
        }
      }

      updateLastMessage(fullContent);

      // 通知父窗口保存历史
      notifyParent('SAVE_HISTORY', {
        messages: [...messages, userMsg, { ...assistantMsg, content: fullContent }]
      });

    } catch (error) {
      console.error('发送失败:', error);
      updateLastMessage('抱歉，发生了错误，请稍后重试。', { error: true });
    } finally {
      setSending(false);
      setStreamingContent('');
    }
  };

  /**
   * 键盘事件处理
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  /**
   * 获取模型图标
   */
  const getModelIcon = (provider) => {
    const p = provider?.toLowerCase() || '';
    if (p.includes('openai')) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ marginRight: 4 }}>
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.0462 6.0462 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a1.5545 1.5545 0 0 1 .6924 1.3265v5.5283a4.4617 4.4617 0 0 1-5.1489 3.2742zm-2.319-1.9818a4.4612 4.4612 0 0 1-.9545-6.0754l2.0363 1.1764a.7948.7948 0 0 0 .7795.0069l5.803-3.3405v2.345a1.564 1.564 0 0 1-.7795 1.3533l-4.7937 2.7681a1.5606 1.5606 0 0 1-2.0911-1.7662v3.5324zm-2.8996-2.5863a4.4842 4.4842 0 0 1-.8491-3.6923l2.0315 1.1746a.7948.7948 0 0 0 .7834-.0029l5.811-3.354-2.0232-1.1687a1.545 1.545 0 0 1-.7795-1.3532V3.882a4.4617 4.4617 0 0 1 2.8716 7.4276L8.0413 17.861z"/>
        </svg>
      );
    }
    if (p.includes('claude') || p.includes('anthropic')) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ marginRight: 4 }}>
          <path d="M13.86 3.01h-3.72L2.51 16.29h3.72L13.86 3.01zM21.49 16.29h-3.72L10.14 3.01h3.72L21.49 16.29zM12 18.01c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z"/>
        </svg>
      );
    }
    if (p.includes('gemini') || p.includes('google')) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ marginRight: 4 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" fill="#fff"/>
          <path d="M12 14l-2-2 2-2 2 2-2 2z" fill="currentColor"/>
        </svg>
      );
    }
    return null;
  };

  /**
   * 渲染欢迎区域
   */
  const renderWelcome = () => (
    <div className="embed-welcome">
      <div className="embed-welcome-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h2 className="embed-welcome-title">AI 智能助手</h2>
      <p className="embed-welcome-subtitle">
        {pageContext
          ? `已读取「${pageContext.title?.slice(0, 20) || '当前页面'}」，有什么可以帮你？`
          : '我可以帮你分析页面内容、回答问题、提供建议'}
      </p>

      <div className="embed-features">
        {FEATURE_CARDS.map((feature, index) => (
          <div
            key={index}
            className={`embed-feature-card ${!feature.prompt ? 'embed-feature-tip' : ''}`}
            onClick={() => feature.prompt && handleSend(feature.prompt)}
          >
            <span className="embed-feature-icon">{feature.icon}</span>
            <div className="embed-feature-title">{feature.title}</div>
            <div className="embed-feature-desc">
              {feature.tip || feature.desc}
            </div>
            {feature.tip && (
              <div className="embed-feature-badge">提示</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#7c3aed', // Violet 600 - Match the new deep space theme
        }
      }}
    >
      <div className="embed-chat">
        {/* 消息区域 */}
        <div className="embed-messages">
        {showWelcome && messages.length === 0 ? (
          renderWelcome()
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={sending && index === messages.length - 1}
                streamingContent={sending && index === messages.length - 1 ? streamingContent : null}
                onSuggestionClick={(s) => handleSend(s)}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="embed-input-wrapper">
        {/* 页面上下文标识 */}
        {pageContext && (
          <div className="embed-context-bar">
            <div className="embed-context-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="embed-context-info">
              <div className="embed-context-label">当前页面</div>
              <div className="embed-context-title">
                {pageContext.title?.slice(0, 40) || '未知页面'}
              </div>
            </div>
          </div>
        )}

        {/* 快捷操作 */}
        {messages.length > 0 && !sending && (
          <div className="embed-quick-actions">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={index}
                className="embed-quick-btn"
                onClick={() => handleSend(action.prompt)}
              >
                <span className="embed-quick-btn-icon">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* 输入提示 */}
        <div className="embed-input-hint" style={{ marginBottom: 8, padding: '0 4px' }}>
          <span className="embed-input-hint-text" style={{ display: 'flex', alignItems: 'center' }}>
            {modelInfo ? (
              <span>当前模型：{modelInfo.name}</span>
            ) : (
              '基于页面内容智能回答'
            )}
          </span>
          <span className="embed-input-hint-key">
            <kbd>Enter</kbd> 发送
          </span>
        </div>

        {/* 输入框容器 */}
        <div className="embed-input-container">
          <div className="embed-input-inner">
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题，我来帮你分析..."
              autoSize={{ minRows: 1, maxRows: 5 }}
              disabled={sending}
              className="embed-textarea"
            />
            <Button
              type="primary"
              icon={sending ? <LoadingOutlined spin /> : <SendOutlined />}
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || sending}
              className="embed-send-btn"
            />
          </div>
        </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default EmbedChat;
