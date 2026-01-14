import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Avatar, Button, Tooltip, Collapse, Image, Space, Tag, Card } from 'antd';
import {
  UserOutlined,
  RobotOutlined,
  CopyOutlined,
  CheckOutlined,
  BulbOutlined,
  DownloadOutlined,
  DownOutlined,
  GlobalOutlined,
  LinkOutlined,
  FileTextOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import './ChatMessage.css';

/**
 * 解析消息内容，分离think标签和正式回答
 * @param {string} content 原始内容
 * @returns {{ thinkContent: string|null, mainContent: string }}
 */
const parseThinkContent = (content) => {
  if (!content) return { thinkContent: null, mainContent: '' };
  
  // 匹配 <think>...</think> 标签（支持多行）
  const thinkRegex = /<think>([\s\S]*?)<\/think>/gi;
  const matches = content.match(thinkRegex);
  
  if (!matches || matches.length === 0) {
    return { thinkContent: null, mainContent: content };
  }
  
  // 提取思考内容
  let thinkContent = '';
  matches.forEach(match => {
    const innerContent = match.replace(/<\/?think>/gi, '').trim();
    thinkContent += innerContent + '\n';
  });
  
  // 移除think标签，获取主要内容
  let mainContent = content.replace(thinkRegex, '').trim();
  
  return { 
    thinkContent: thinkContent.trim() || null, 
    mainContent 
  };
};

/**
 * 解析消息内容，分离文件引用
 * 匹配格式：[文件内容: xxx.xlsx] 后跟代码块
 * @param {string} content 原始内容
 * @param {boolean} isUser 是否是用户消息
 * @returns {{ fileNames: string[], cleanContent: string }}
 */
const parseFileReferences = (content, isUser) => {
  if (!content || !isUser) return { fileNames: [], cleanContent: content };
  
  // 匹配 [文件内容: filename] 后跟代码块的模式
  const filePattern = /\n?\n?\[文件内容:\s*([^\]]+)\]\n```[\s\S]*?```/gi;
  const fileNames = [];
  let match;
  
  // 提取所有文件名
  while ((match = filePattern.exec(content)) !== null) {
    fileNames.push(match[1].trim());
  }
  
  // 移除文件内容块，保留纯文本
  let cleanContent = content.replace(filePattern, '').trim();
  
  return { fileNames, cleanContent };
};

/**
 * 消息组件
 * 支持Markdown渲染、代码高亮、思考过程展示、联网搜索引用
 */
const ChatMessage = ({
  message,
  isStreaming,
  streamingContent,
  onSuggestionClick,
  userName,
  searchInfo,
  knowledgeInfo
}) => {
  const [copied, setCopied] = useState(false);
  const [thinkExpanded, setThinkExpanded] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const isUser = message.role === 'user';
  const rawContent = isStreaming && streamingContent !== null ? streamingContent : message.content;
  
  // 解析think内容
  const { thinkContent, mainContent } = useMemo(() => {
    return parseThinkContent(rawContent);
  }, [rawContent]);
  
  // 解析文件引用（从历史消息内容中提取文件名）
  const { fileNames: parsedFileNames, cleanContent } = useMemo(() => {
    return parseFileReferences(mainContent, isUser);
  }, [mainContent, isUser]);
  
  // 合并消息自带的files和从内容解析的文件名
  const displayFileNames = useMemo(() => {
    const fromMessage = message.files || [];
    const combined = [...new Set([...fromMessage, ...parsedFileNames])];
    return combined;
  }, [message.files, parsedFileNames]);
  
  // 用户消息显示清理后的内容，AI消息显示原内容
  const content = isUser ? cleanContent : mainContent;

  /**
   * 复制内容
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  /**
   * 下载图片
   */
  const downloadImage = async (src) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('下载图片失败:', err);
      window.open(src, '_blank');
    }
  };

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-container">
        {/* 头像 */}
        <div className="message-avatar">
          {isUser ? (
            <Avatar 
              icon={<UserOutlined />} 
              className="user-avatar"
            />
          ) : (
            <Avatar 
              icon={<RobotOutlined />} 
              className="ai-avatar"
            />
          )}
        </div>

        {/* 消息内容 */}
        <div className="message-content-wrapper">
          <div className="message-header">
            <span className="message-role">
              {isUser ? (userName || '你') : 'AI助手'}
            </span>
            {/* 联网搜索标志 */}
            {!isUser && searchInfo && searchInfo.engine && (
              <Tag color="blue" className="search-tag">
                <GlobalOutlined /> {searchInfo.engine}
              </Tag>
            )}
          </div>

          {/* 引用源信息 */}
          {!isUser && searchInfo && searchInfo.sources && searchInfo.sources.length > 0 && (
            <div className="search-sources">
              <div
                className="sources-header"
                onClick={() => setSourcesExpanded(!sourcesExpanded)}
              >
                <LinkOutlined className="sources-icon" />
                <span className="sources-title">
                  已搜索 {searchInfo.sources.length} 个来源
                </span>
                <DownOutlined
                  className={`sources-arrow ${sourcesExpanded ? 'expanded' : ''}`}
                />
              </div>
              {sourcesExpanded && (
                <div className="sources-list">
                  {searchInfo.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-card"
                    >
                      <div className="source-index">[{source.index}]</div>
                      <div className="source-info">
                        <div className="source-title">{source.title}</div>
                        <div className="source-meta">
                          <span className="source-domain">{source.source}</span>
                          {source.date && <span className="source-date">{source.date}</span>}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 知识库来源信息 */}
          {!isUser && knowledgeInfo && knowledgeInfo.sources && knowledgeInfo.sources.length > 0 && (
            <div className="knowledge-sources">
              <div className="knowledge-header">
                <DatabaseOutlined className="knowledge-icon" />
                <span className="knowledge-title">
                  已检索 {knowledgeInfo.count} 个知识库内容
                </span>
              </div>
              <div className="knowledge-list">
                {knowledgeInfo.sources.map((source, index) => (
                  <div key={index} className="knowledge-item">
                    <FileTextOutlined className="kb-file-icon" />
                    <span className="kb-file-name">{source.fileName}</span>
                    <span className="kb-name">({source.knowledgeBase})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 用户消息的附件展示 */}
          {isUser && displayFileNames && displayFileNames.length > 0 && (
            <div className="message-attachments">
              {displayFileNames.map((fileName, index) => (
                <span key={index} className="attachment-tag">
                  <FileTextOutlined /> {fileName}
                </span>
              ))}
            </div>
          )}

          <div className={`message-content ${message.error ? 'error' : ''}`}>
            {/* 思考过程展示 */}
            {!isUser && thinkContent && (
              <div className="think-block">
                <div 
                  className="think-header"
                  onClick={() => setThinkExpanded(!thinkExpanded)}
                >
                  <BulbOutlined className="think-icon" />
                  <span className="think-title">思考过程</span>
                  <DownOutlined 
                    className={`think-arrow ${thinkExpanded ? 'expanded' : ''}`} 
                  />
                </div>
                {thinkExpanded && (
                  <div className="think-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {thinkContent}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {/* 正式回答 */}
            {isUser ? (
              <p>{content}</p>
            ) : content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // 代码块自定义渲染
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="code-block">
                        <div className="code-header">
                          <span className="code-language">{match[1]}</span>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => {
                              navigator.clipboard.writeText(String(children));
                            }}
                          >
                            复制
                          </Button>
                        </div>
                        <pre className={className}>
                          <code {...props}>{children}</code>
                        </pre>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // 表格样式
                  table({ children }) {
                    return (
                      <div className="table-wrapper">
                        <table>{children}</table>
                      </div>
                    );
                  },
                  // 图片样式
                  img({ node, ...props }) {
                    return (
                      <div className="chat-image-wrapper" style={{ margin: '12px 0' }}>
                        <Image
                          src={props.src}
                          alt={props.alt}
                          style={{ maxWidth: '100%', borderRadius: '8px' }}
                          placeholder={
                            <div style={{ 
                              width: '100%', 
                              height: 200, 
                              background: '#f0f2f5',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              加载中...
                            </div>
                          }
                        />
                        <div style={{ marginTop: 8 }}>
                          <Button 
                            size="small" 
                            icon={<DownloadOutlined />} 
                            onClick={() => downloadImage(props.src)}
                          >
                            下载图片
                          </Button>
                        </div>
                      </div>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            {/* 流式响应时显示光标 */}
            {isStreaming && content && (
              <span className="streaming-cursor">▊</span>
            )}
          </div>

          {/* 操作按钮和推荐追问 */}
          {!isUser && !isStreaming && (
            <div className="message-actions">
              {content && (
                <Tooltip title={copied ? '已复制' : '复制'}>
                  <Button 
                    type="text" 
                    size="small"
                    className="action-btn"
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={handleCopy}
                  />
                </Tooltip>
              )}
              
              {/* 推荐追问 - 直接跟在复制按钮后面 */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="suggestions-list">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      size="small"
                      className="suggestion-btn"
                      onClick={() => onSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
