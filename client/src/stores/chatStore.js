import { create } from 'zustand';

/**
 * 聊天状态管理
 * 管理对话列表、当前对话、消息等
 */
const useChatStore = create((set, get) => ({
  // 对话列表
  conversations: [],
  // 当前选中的对话ID
  currentConversationId: null,
  // 当前对话的消息
  messages: [],
  // 是否正在加载
  loading: false,
  // 是否正在发送消息
  sending: false,
  // 当前Agent
  currentAgent: null,
  // 侧边栏模式：'chat' | 'agents'
  sidebarMode: 'chat',
  // 是否使用联网搜索
  useWeb: false,
  // 搜索引擎：'tavily' | 'serper' | 'bocha' | 'bing' | 'duckduckgo'
  searchEngine: 'tavily',
  // 选中的知识库IDs
  selectedKnowledgeBaseIds: [],

  /**
   * 设置对话列表
   */
  setConversations: (conversations) => set({ conversations }),

  /**
   * 添加新对话
   */
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations]
  })),

  /**
   * 删除对话
   */
  removeConversation: (id) => set((state) => ({
    conversations: state.conversations.filter(c => c.id !== id),
    currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
    messages: state.currentConversationId === id ? [] : state.messages
  })),

  /**
   * 更新对话标题
   */
  updateConversationTitle: (id, title) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === id ? { ...c, title } : c
    )
  })),

  /**
   * 设置当前对话
   */
  setCurrentConversation: (id) => set({ 
    currentConversationId: id,
    messages: []
  }),

  /**
   * 设置消息列表
   */
  setMessages: (messages) => set({ messages }),

  /**
   * 添加消息
   */
  addMessage: (message) => set((state) => {
    const messages = Array.isArray(state.messages) ? state.messages : [];
    return {
      messages: [...messages, message]
    };
  }),

  /**
   * 更新最后一条消息（用于流式响应）
   */
  updateLastMessage: (content, extra = {}) => set((state) => {
    const messages = Array.isArray(state.messages) ? [...state.messages] : [];
    if (messages.length > 0) {
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content,
        ...extra
      };
    }
    return { messages };
  }),

  /**
   * 设置加载状态
   */
  setLoading: (loading) => set({ loading }),

  /**
   * 设置发送状态
   */
  setSending: (sending) => set({ sending }),

  /**
   * 设置当前Agent
   */
  setCurrentAgent: (agent) => set({ currentAgent: agent }),

  /**
   * 设置侧边栏模式
   */
  setSidebarMode: (mode) => set({ sidebarMode: mode }),

  /**
   * 切换联网搜索
   */
  toggleUseWeb: () => set((state) => ({ useWeb: !state.useWeb })),

  /**
   * 设置搜索引擎
   */
  setSearchEngine: (engine) => set({ searchEngine: engine }),

  /**
   * 设置选中的知识库
   */
  setSelectedKnowledgeBaseIds: (ids) => set({ selectedKnowledgeBaseIds: ids }),

  /**
   * 重置聊天状态
   */
  reset: () => set({
    conversations: [],
    currentConversationId: null,
    messages: [],
    loading: false,
    sending: false,
    currentAgent: null
  })
}));

export default useChatStore;
