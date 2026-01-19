import { useState, useRef, useEffect } from 'react';
import { Input, Button, Tooltip, Popover, Checkbox, Badge, Upload, message, Segmented, Switch, Select } from 'antd';
import {
  SendOutlined,
  PaperClipOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  StopOutlined,
  PictureOutlined,
  MessageOutlined,
  FileTextOutlined,
  CloseOutlined,
  SearchOutlined,
  DownOutlined,
  LoadingOutlined,
  RobotOutlined
} from '@ant-design/icons';
import useChatStore from '../stores/chatStore';
import { getAvailableSearchEngines, getKnowledgeBases, uploadFiles } from '../api/chat';
import { getAvailableModels } from '../api/model';
import './ChatInput.css';

const { TextArea } = Input;

/**
 * 聊天输入组件
 * 包含工具栏：文件上传、联网搜索、知识库选择、模型选择、模式切换
 */
const ChatInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('chat'); // 'chat' | 'image'
  const [uploadedFiles, setUploadedFiles] = useState([]); // { file, status, content, error }
  const [uploading, setUploading] = useState(false);
  const [searchEngines, setSearchEngines] = useState([]);
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    useWeb,
    toggleUseWeb,
    searchEngine,
    setSearchEngine,
    selectedKnowledgeBaseIds,
    setSelectedKnowledgeBaseIds,
    selectedModelId,
    setSelectedModelId,
    sending,
    currentConversationId // 监听对话切换
  } = useChatStore();

  // 切换对话时重置输入状态
  useEffect(() => {
    setValue('');
    setMode('chat');  // 重置为对话模式
    setUploadedFiles([]);
  }, [currentConversationId]);

  // 加载可用的搜索引擎列表
  useEffect(() => {
    const loadSearchEngines = async () => {
      try {
        const res = await getAvailableSearchEngines();
        if (res.code === 200 && res.data && res.data.length > 0) {
          setSearchEngines(res.data);
          // 如果当前选择的引擎是auto或不在列表中，设置为第一个可用引擎
          const engineKeys = res.data.map(e => e.key);
          if (searchEngine === 'auto' || !engineKeys.includes(searchEngine)) {
            // 优先选择tavily，否则选第一个
            const defaultEngine = res.data.find(e => e.key === 'tavily') || res.data[0];
            setSearchEngine(defaultEngine.key);
          }
        }
      } catch (error) {
        console.error('获取搜索引擎列表失败:', error);
      }
    };
    loadSearchEngines();
  }, []);

  // 加载知识库列表
  useEffect(() => {
    const loadKnowledgeBases = async () => {
      try {
        const res = await getKnowledgeBases();
        if (res.code === 200 && res.data) {
          // 只显示激活的企业知识库
          const activeKbs = Array.isArray(res.data)
            ? res.data.filter(kb => kb.isActive)
            : [];
          setKnowledgeBases(activeKbs);
        }
      } catch (error) {
        console.error('获取知识库列表失败:', error);
      }
    };
    loadKnowledgeBases();
  }, []);

  // 加载可用模型列表（根据 mode 过滤）
  useEffect(() => {
    const loadModels = async () => {
      setModelsLoading(true);
      try {
        const res = await getAvailableModels(mode);
        if (res.code === 200 && res.data) {
          setAvailableModels(res.data);
          // 如果当前选中的模型不在列表中，选择默认模型
          const modelIds = res.data.map(m => m.id);
          if (!modelIds.includes(selectedModelId)) {
            // 优先选择默认模型，否则选第一个
            const defaultModel = res.data.find(m => m.isDefault === 1) || res.data[0];
            setSelectedModelId(defaultModel?.id || null);
          }
        }
      } catch (error) {
        console.error('获取模型列表失败:', error);
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, [mode]);

  /**
   * 处理发送
   */
  const handleSend = () => {
    if (value.trim() && !disabled && !uploading) {
      // 用户输入的原始内容
      const content = value.trim();

      // 获取成功上传的文件
      const successFiles = uploadedFiles.filter(f => f.status === 'done' && f.content);
      
      // 传递文件信息和模型ID给Chat组件
      onSend(content, { 
        mode, 
        modelId: selectedModelId,
        files: successFiles.map(f => ({ name: f.file.name, content: f.content })),
        fileNames: successFiles.map(f => f.file.name)
      });
      setValue('');
      setUploadedFiles([]);
    }
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  /**
   * 处理文件选择并上传
   */
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        message.warning(`文件 ${file.name} 超过10MB限制`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    // 限制最多5个文件
    const filesToUpload = validFiles.slice(0, 5 - uploadedFiles.length);
    if (filesToUpload.length < validFiles.length) {
      message.warning('最多只能上传5个文件');
    }

    // 添加文件到列表，状态为uploading
    const newFiles = filesToUpload.map(file => ({
      file,
      status: 'uploading',
      content: null,
      error: null
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploading(true);

    try {
      // 调用上传API
      const result = await uploadFiles(filesToUpload);
      if (result.code === 200 && result.data) {
        // 更新文件状态为done，并保存解析的内容
        setUploadedFiles(prev => prev.map(f => {
          const uploadResult = result.data.find(r => r.originalName === f.file.name);
          if (uploadResult) {
            return {
              ...f,
              status: 'done',
              content: uploadResult.content,
              error: null
            };
          }
          return f;
        }));
        message.success(`已解析 ${result.data.length} 个文件`);
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      // 更新文件状态为error
      setUploadedFiles(prev => prev.map(f => {
        if (newFiles.some(nf => nf.file === f.file)) {
          return { ...f, status: 'error', error: error.message };
        }
        return f;
      }));
      message.error('文件上传失败，请重试');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /**
   * 移除上传的文件
   */
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * 联网搜索弹窗内容
   */
  const webSearchContent = (
    <div className="web-search-popover">
      <div className="web-search-header">
        <GlobalOutlined className="header-icon" />
        <div className="header-text">
          <span className="header-title">联网模式</span>
          <span className="header-hint">关闭后停用互联网资料</span>
        </div>
        <Switch
          checked={useWeb}
          onChange={toggleUseWeb}
          className="web-switch"
        />
      </div>
    </div>
  );

  /**
   * 知识库选择内容
   */
  const knowledgeBaseContent = (
    <div className="kb-popover">
      <div className="kb-title">选择知识库</div>
      {knowledgeBases.length > 0 ? (
        <Checkbox.Group
          value={selectedKnowledgeBaseIds}
          onChange={setSelectedKnowledgeBaseIds}
        >
          {knowledgeBases.map(kb => (
            <div key={kb.id} className="kb-item">
              <Checkbox value={kb.id}>{kb.name}</Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      ) : (
        <div className="kb-empty">暂无可用知识库</div>
      )}
    </div>
  );

  return (
    <div className="chat-input">
      {/* 上传文件预览 */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          {uploadedFiles.map((fileItem, index) => (
            <div key={index} className={`uploaded-file ${fileItem.status}`}>
              {fileItem.status === 'uploading' ? (
                <LoadingOutlined className="file-icon loading" spin />
              ) : fileItem.status === 'error' ? (
                <CloseOutlined className="file-icon error" />
              ) : (
                <FileTextOutlined className="file-icon" />
              )}
              <span className="file-name">{fileItem.file.name}</span>
              {fileItem.status === 'done' && fileItem.content && (
                <span className="file-size">
                  ({Math.round(fileItem.content.length / 1000)}k字)
                </span>
              )}
              {fileItem.status !== 'uploading' && (
                <CloseOutlined
                  className="file-remove"
                  onClick={() => removeFile(index)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 工具栏 */}
      <div className="input-toolbar">
        <div className="toolbar-left">
          {/* 隐藏的文件input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".txt,.md,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json"
            style={{ display: 'none' }}
          />
          
          {/* 文件上传 */}
          <Tooltip title={uploading ? '正在解析文件...' : '上传文件'}>
            <Badge count={uploadedFiles.filter(f => f.status === 'done').length} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={uploading ? <LoadingOutlined spin /> : <PaperClipOutlined />}
                onClick={handleFileUpload}
                disabled={uploading}
                className={`toolbar-btn ${uploadedFiles.length > 0 ? 'active' : ''}`}
              />
            </Badge>
          </Tooltip>

          {/* 联网搜索 */}
          <Popover
            content={webSearchContent}
            trigger="click"
            placement="topLeft"
          >
            <Tooltip title="联网搜索">
              <Badge dot={useWeb} offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<GlobalOutlined />}
                  className={`toolbar-btn ${useWeb ? 'active' : ''}`}
                />
              </Badge>
            </Tooltip>
          </Popover>

          {/* 知识库 */}
          <Popover
            content={knowledgeBaseContent}
            trigger="click"
            placement="topLeft"
          >
            <Tooltip title="选择知识库">
              <Badge 
                count={selectedKnowledgeBaseIds.length} 
                size="small"
                offset={[-2, 2]}
              >
                <Button
                  type="text"
                  icon={<DatabaseOutlined />}
                  className={`toolbar-btn ${selectedKnowledgeBaseIds.length > 0 ? 'active' : ''}`}
                />
              </Badge>
            </Tooltip>
          </Popover>

          {/* 模型选择器 */}
          <Tooltip title="选择模型">
            <Select
              size="small"
              value={selectedModelId}
              onChange={setSelectedModelId}
              loading={modelsLoading}
              disabled={modelsLoading}
              placeholder="选择模型"
              className="model-selector"
              popupMatchSelectWidth={180}
              suffixIcon={<DownOutlined />}
              options={availableModels.map(m => ({
                value: m.id,
                label: m.name,
              }))}
            />
          </Tooltip>

          {/* 模式切换分隔线 */}
          <div className="toolbar-divider" />

          {/* 模式切换 */}
          <Segmented
            size="small"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'chat', icon: <MessageOutlined />, label: '对话' },
              { value: 'image', icon: <PictureOutlined />, label: '绘画' }
            ]}
            className={`mode-switch ${mode}-mode`}
          />
        </div>

        <div className="toolbar-right">
          {selectedKnowledgeBaseIds.length > 0 && (
            <span className="toolbar-tag kb">
              <DatabaseOutlined /> {selectedKnowledgeBaseIds.length}个知识库
            </span>
          )}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="input-area">
        <TextArea
          ref={textAreaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'image' ? '描述你想生成的图片...' : '输入消息，Shift+Enter换行...'}
          autoSize={{ minRows: 1, maxRows: 6 }}
          disabled={disabled}
          className="input-textarea"
        />
        
        <Button
          type="primary"
          icon={sending ? <StopOutlined /> : <SendOutlined />}
          onClick={sending ? undefined : handleSend}
          disabled={!value.trim() || disabled || uploading}
          className="send-btn"
        >
          {sending ? '停止' : (mode === 'image' ? '生成' : '发送')}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
