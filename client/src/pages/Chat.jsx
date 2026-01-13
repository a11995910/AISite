import { useEffect, useRef, useState } from 'react';
import { Empty, Spin } from 'antd';
import { RobotOutlined, SendOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import useChatStore from '../stores/chatStore';
import useUserStore from '../stores/userStore';
import { getMessages, sendMessage, createConversation } from '../api/chat';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import './Chat.css';

/**
 * 读取文件内容为文本
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    // 处理 Excel 文件
    if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          // 获取第一个工作表
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // 转换为CSV文本
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          resolve(csv);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
      return;
    }

    // 处理普通文本文件
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

/**
 * 对话页面
 * 显示消息列表和输入框
 */
const ChatPage = () => {
  const messagesEndRef = useRef(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentSearchInfo, setCurrentSearchInfo] = useState(null);
  const [agentPromptCollapsed, setAgentPromptCollapsed] = useState(true);
  
  const { user } = useUserStore();
  const {
    currentConversationId,
    messages,
    setMessages,
    addMessage,
    sending,
    setSending,
    loading,
    setLoading,
    currentAgent,
    useWeb,
    searchEngine,
    selectedKnowledgeBaseIds,
    updateLastMessage,
    setCurrentConversation,
    updateConversationTitle,
    addConversation
  } = useChatStore();

  // 加载消息历史
  useEffect(() => {
    if (currentConversationId) {
      loadMessages();
    }
  }, [currentConversationId]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // 同步当前Agent状态
  useEffect(() => {
    if (currentConversationId) {
      const conv = useChatStore.getState().conversations.find(c => c.id === currentConversationId);
      if (conv?.agent) {
        useChatStore.getState().setCurrentAgent(conv.agent);
      } else {
        useChatStore.getState().setCurrentAgent(null);
      }
    }
  }, [currentConversationId]);

  /**
   * 加载消息列表
   */
  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await getMessages(currentConversationId);
      if (res.code === 200) {
        setMessages(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('加载消息失败:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * 发送消息
   */
  const handleSend = async (content, options = {}) => {
    if (!content.trim() || sending) return;
    
    // 提取选项
    const { mode = 'chat', files = [] } = options;

    let conversationId = currentConversationId;

    // 如果没有当前对话，先创建一个
    if (!conversationId) {
      try {
        const res = await createConversation({ 
          title: content.slice(0, 20) + (content.length > 20 ? '...' : ''),
          agentId: currentAgent?.id 
        });
        if (res.code === 200) {
          conversationId = res.data.id;
          addConversation(res.data);
          setCurrentConversation(res.data.id);
        } else {
          return;
        }
      } catch (error) {
        console.error('创建对话失败:', error);
        return;
      }
    }

    // 处理文件内容 - 从ChatInput传来的files已经是 {name, content} 格式
    let finalContent = content;
    
    if (files && files.length > 0) {
      // 将文件内容附加到消息中（发送给AI分析）
      for (const file of files) {
        if (file.content) {
          finalContent += `\n\n[文件内容: ${file.name}]\n\`\`\`\n${file.content.slice(0, 50000)}\n\`\`\``;
        }
      }
    }

    // 添加用户消息到列表
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content, // 显示原始输入（不包含文件内容）
      files: options.fileNames || [], // 携带的文件名列表，用于UI展示
      createdAt: new Date().toISOString()
    };
    addMessage(userMessage);

    // 添加AI消息占位
    const aiMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString()
    };
    addMessage(aiMessage);

    setSending(true);
    setStreamingContent('');
    setCurrentSearchInfo(null);

    try {
      // 使用流式响应
      const token = localStorage.getItem('user-storage');
      let authToken = '';
      try {
        const parsed = JSON.parse(token);
        authToken = parsed?.state?.token || '';
      } catch {
        authToken = '';
      }

      const response = await fetch(`http://localhost:3001/api/chat/conversations/${conversationId}/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          content: finalContent,
          useWeb,
          searchEngine,
          knowledgeBaseIds: selectedKnowledgeBaseIds,
          agentId: currentAgent?.id,
          mode,
          files: files
        })
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

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
            const data = line.slice(6);
            if (data === '[DONE]') {
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              }
              if (parsed.searchInfo) {
                // 收到搜索信息
                setCurrentSearchInfo(parsed.searchInfo);
              }
              if (parsed.conversationTitle) {
                // 收到AI生成的对话标题，更新对话列表
                updateConversationTitle(conversationId, parsed.conversationTitle);
              }
              if (parsed.suggestions) {
                // 处理推荐追问，使用store方法更新
                updateLastMessage(fullContent, { suggestions: parsed.suggestions });
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      // 最终更新一次确保内容完整
      updateLastMessage(fullContent);

    } catch (error) {
      console.error('发送消息失败:', error);
      // 更新错误消息
      updateLastMessage('抱歉，发生了错误，请稍后重试。', { error: true });
    } finally {
      setSending(false);
      setStreamingContent('');
    }
  };

  /**
   * 处理点击推荐追问
   */
  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  // 空状态
  if (!currentConversationId && messages.length === 0) {
    return (
      <div className="chat-page">
        <div className="chat-empty">
          <h2>开始新对话</h2>
          <p>向AI助手提问，获取智能回答</p>
          {currentAgent && (
            <div className="current-agent">
              当前助手：<strong>{currentAgent.name}</strong>
            </div>
          )}
        </div>
        <div className="chat-input-wrapper">
          <ChatInput onSend={handleSend} disabled={sending} />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {currentAgent && currentAgent.systemPrompt && (
          <div className={`agent-prompt-header ${agentPromptCollapsed ? 'collapsed' : ''}`}>
             <div
               className="agent-info-bar"
               onClick={() => setAgentPromptCollapsed(!agentPromptCollapsed)}
             >
               <RobotOutlined className="agent-icon-small" />
               <span className="agent-name-text">{currentAgent.name}</span>
               <span className="agent-role-badge">Agent</span>
               <span className="agent-prompt-toggle">
                 {agentPromptCollapsed ? <RightOutlined /> : <DownOutlined />}
                 <span className="toggle-text">{agentPromptCollapsed ? '展开设定' : '收起'}</span>
               </span>
             </div>
             {!agentPromptCollapsed && (
               <div className="agent-prompt-content">
                 {currentAgent.systemPrompt}
               </div>
             )}
          </div>
        )}
        {loading ? (
          <div className="chat-loading">
            <Spin />
          </div>
        ) : (
          <>
            {Array.isArray(messages) && messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={sending && index === messages.length - 1}
                streamingContent={sending && index === messages.length - 1 ? streamingContent : null}
                onSuggestionClick={handleSuggestionClick}
                userName={user?.name}
                searchInfo={index === messages.length - 1 ? currentSearchInfo : msg.searchInfo}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div className="chat-input-wrapper">
        <ChatInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
};


export default ChatPage;
