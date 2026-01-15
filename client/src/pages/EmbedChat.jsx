import { useEffect, useRef, useState, useCallback } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import ChatMessage from '../components/ChatMessage';
import './EmbedChat.css';

const EmbedChat = () => {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [pageContext, setPageContext] = useState(null);
  const [token, setToken] = useState('');

  const updateLastMessage = useCallback((content, extra = {}) => {
    setMessages(prev => {
      const arr = [...prev];
      if (arr.length > 0) {
        arr[arr.length - 1] = { ...arr[arr.length - 1], content, ...extra };
      }
      return arr;
    });
  }, []);

  const notifyParent = (type, data) => {
    window.parent.postMessage({ type, data }, '*');
  };

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data } = event.data || {};
      if (type === 'PAGE_CONTEXT') {
        setPageContext(data);
        if (data.token) setToken(data.token);
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: '我已读取当前页面「' + (data.title || '未知页面') + '」的内容。\n\n有什么可以帮你的吗？',
          createdAt: new Date().toISOString()
        }]);
      } else if (type === 'SEND_MESSAGE' && data?.content) {
        doSend(data.content);
      }
    };
    window.addEventListener('message', handleMessage);
    notifyParent('READY', {});
    notifyParent('REQUEST_PAGE_CONTEXT', {});
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const doSend = async (content) => {
    if (!content?.trim() || sending) return;
    const userContent = content.trim();
    setInputValue('');

    setMessages(prev => [...prev, {
      id: Date.now(), role: 'user', content: userContent, createdAt: new Date().toISOString()
    }, {
      id: Date.now() + 1, role: 'assistant', content: '', createdAt: new Date().toISOString()
    }]);

    setSending(true);
    setStreamingContent('');

    try {
      let finalContent = userContent;
      if (pageContext) {
        finalContent = '[页面上下文]\nURL: ' + (pageContext.url || '') + '\n标题: ' + (pageContext.title || '') + '\n页面内容摘要:\n' + (pageContext.content?.slice(0, 5000) || '无') + '\n\n[用户问题]\n' + userContent;
      }

      const response = await fetch('http://localhost:3001/api/chat/embed/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': 'Bearer ' + token })
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
    } catch (error) {
      console.error('发送失败:', error);
      updateLastMessage('抱歉，发生了错误，请稍后重试。', { error: true });
    } finally {
      setSending(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend(inputValue);
    }
  };

  return (
    <div className="embed-chat">
      <div className="embed-messages">
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isStreaming={sending && index === messages.length - 1}
            streamingContent={sending && index === messages.length - 1 ? streamingContent : null}
            onSuggestionClick={(s) => doSend(s)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="embed-input-wrapper">
        {pageContext && (
          <div className="embed-context-badge">
            <span className="context-icon">📄</span>
            <span className="context-title">{pageContext.title?.slice(0, 30) || '当前页面'}</span>
          </div>
        )}
        <div className="embed-input-row">
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="基于当前页面内容提问..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={sending}
            className="embed-input"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => doSend(inputValue)}
            disabled={!inputValue.trim() || sending}
            loading={sending}
            className="embed-send-btn"
          />
        </div>
      </div>
    </div>
  );
};

export default EmbedChat;