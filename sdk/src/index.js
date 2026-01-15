/**
 * AI Assistant SDK
 * 可嵌入到任意系统的AI助手侧边栏
 *
 * 功能特性：
 * - 侧边栏对话
 * - 划词提问
 * - 表单辅助填写
 * - 历史记录保存
 */

import { createStyles } from './styles.js';
import { PageExtractor } from './extractor.js';
import { Messenger } from './messenger.js';

/**
 * AI助手主类
 */
class AIAssistant {
  constructor(config = {}) {
    this.config = {
      serverUrl: config.serverUrl || 'http://localhost:5173',
      position: config.position || 'right',
      width: config.width || '400px',
      primaryColor: config.primaryColor || '#1677ff',
      token: config.token || '',
      buttonIcon: config.buttonIcon || null,
      autoShow: config.autoShow || false,
      zIndex: config.zIndex || 99999,
      enableSelection: config.enableSelection !== false, // 划词提问，默认开启
      enableFormFill: config.enableFormFill !== false,   // 表单填写，默认开启
      enableHistory: config.enableHistory !== false,     // 历史记录，默认开启
      historyKey: config.historyKey || 'ai-assistant-history', // localStorage key
      maxHistory: config.maxHistory || 50,               // 最大历史条数
      onReady: config.onReady || (() => {}),
      onOpen: config.onOpen || (() => {}),
      onClose: config.onClose || (() => {})
    };

    this.isOpen = false;
    this.iframe = null;
    this.sidebar = null;
    this.toggleBtn = null;
    this.overlay = null;
    this.selectionMenu = null;
    this.extractor = new PageExtractor();
    this.messenger = null;
    this.currentSelection = null;

    this._init();
  }

  _init() {
    this._injectStyles();
    this._createToggleButton();
    this._createSidebar();
    this._createOverlay();
    this._createSelectionMenu();
    this._setupMessenger();
    this._bindEvents();

    if (this.config.autoShow) {
      setTimeout(() => this.open(), 500);
    }

    this.config.onReady();
    console.log('[AI Assistant] SDK 初始化完成');
  }

  _injectStyles() {
    const styleId = 'ai-assistant-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = createStyles(this.config);
    document.head.appendChild(style);
  }

  _createToggleButton() {
    const btn = document.createElement('div');
    btn.id = 'ai-assistant-btn';
    btn.className = 'ai-assistant-btn';
    btn.innerHTML = this.config.buttonIcon || `
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `;
    btn.title = 'AI 助手';
    btn.addEventListener('click', () => this.toggle());
    document.body.appendChild(btn);
    this.toggleBtn = btn;
  }

  _createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'ai-assistant-sidebar';
    sidebar.className = `ai-assistant-sidebar ai-assistant-sidebar-${this.config.position}`;

    const header = document.createElement('div');
    header.className = 'ai-assistant-header';
    header.innerHTML = `
      <div class="ai-assistant-title">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <span>AI 助手</span>
      </div>
      <div class="ai-assistant-header-actions">
        <button class="ai-assistant-history-btn" title="历史记录">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
        </button>
        <button class="ai-assistant-clear-btn" title="清空对话">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
        <button class="ai-assistant-close" title="关闭">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    `;

    header.querySelector('.ai-assistant-close').addEventListener('click', () => this.close());
    header.querySelector('.ai-assistant-history-btn').addEventListener('click', () => this._toggleHistoryPanel());
    header.querySelector('.ai-assistant-clear-btn').addEventListener('click', () => this._clearHistory());

    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'ai-assistant-iframe-container';

    this.iframe = document.createElement('iframe');
    this.iframe.src = `${this.config.serverUrl}/embed`;
    this.iframe.className = 'ai-assistant-iframe';
    this.iframe.setAttribute('allow', 'clipboard-write');

    iframeContainer.appendChild(this.iframe);
    sidebar.appendChild(header);
    sidebar.appendChild(iframeContainer);

    document.body.appendChild(sidebar);
    this.sidebar = sidebar;
  }

  _createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'ai-assistant-overlay';
    overlay.className = 'ai-assistant-overlay';
    overlay.addEventListener('click', () => this.close());
    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  /**
   * 创建划词快捷菜单
   */
  _createSelectionMenu() {
    if (!this.config.enableSelection) return;

    const menu = document.createElement('div');
    menu.id = 'ai-assistant-selection-menu';
    menu.className = 'ai-selection-menu';
    menu.innerHTML = `
      <button class="ai-selection-btn ai-selection-ask" title="询问AI">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
        </svg>
        <span>问AI</span>
      </button>
      <button class="ai-selection-btn ai-selection-explain" title="解释">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
        <span>解释</span>
      </button>
      <button class="ai-selection-btn ai-selection-translate" title="翻译">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        </svg>
        <span>翻译</span>
      </button>
      <button class="ai-selection-btn ai-selection-summarize" title="总结">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
        </svg>
        <span>总结</span>
      </button>
    `;

    menu.querySelector('.ai-selection-ask').addEventListener('click', () => {
      this._askAboutSelection(this.currentSelection);
    });
    menu.querySelector('.ai-selection-explain').addEventListener('click', () => {
      this._askAboutSelection(this.currentSelection, '请解释以下内容：');
    });
    menu.querySelector('.ai-selection-translate').addEventListener('click', () => {
      this._askAboutSelection(this.currentSelection, '请翻译以下内容：');
    });
    menu.querySelector('.ai-selection-summarize').addEventListener('click', () => {
      this._askAboutSelection(this.currentSelection, '请总结以下内容：');
    });

    document.body.appendChild(menu);
    this.selectionMenu = menu;
  }

  _setupMessenger() {
    this.messenger = new Messenger(this.iframe, this.config.serverUrl);

    this.messenger.on('REQUEST_PAGE_CONTEXT', () => {
      this._sendPageContext();
    });

    this.messenger.on('CLOSE_SIDEBAR', () => {
      this.close();
    });

    this.messenger.on('READY', () => {
      console.log('[AI Assistant] iframe 已就绪');
      if (this.isOpen) {
        this._sendPageContext();
      }
      // 发送历史记录
      if (this.config.enableHistory) {
        const history = this._getHistory();
        this.messenger.send('LOAD_HISTORY', { messages: history });
      }
    });

    // 监听保存历史记录请求
    this.messenger.on('SAVE_HISTORY', (data) => {
      if (this.config.enableHistory && data.messages) {
        this._saveHistory(data.messages);
      }
    });

    // 监听表单填写指令
    this.messenger.on('FILL_FORM', (data) => {
      if (this.config.enableFormFill && data.fields) {
        this._fillForm(data.fields);
      }
    });

    // 监听清空历史请求
    this.messenger.on('CLEAR_HISTORY', () => {
      this._clearHistory();
    });
  }

  _bindEvents() {
    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isOpen) this.close();
        this._hideSelectionMenu();
      }
    });

    // 划词选中事件
    if (this.config.enableSelection) {
      document.addEventListener('mouseup', (e) => {
        // 忽略来自菜单和侧边栏的点击
        if (e.target.closest('#ai-assistant-selection-menu') ||
            e.target.closest('#ai-assistant-sidebar')) {
          return;
        }

        setTimeout(() => {
          const selectedText = window.getSelection().toString().trim();
          if (selectedText && selectedText.length > 0 && selectedText.length < 1000) {
            this.currentSelection = selectedText;
            this._showSelectionMenu(e.clientX, e.clientY);
          } else {
            this._hideSelectionMenu();
          }
        }, 10);
      });

      // 点击其他地方隐藏菜单
      document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('#ai-assistant-selection-menu')) {
          this._hideSelectionMenu();
        }
      });
    }
  }

  /**
   * 显示划词菜单
   */
  _showSelectionMenu(x, y) {
    if (!this.selectionMenu) return;

    const menu = this.selectionMenu;
    menu.style.display = 'flex';

    // 计算位置，确保不超出视口
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = x;
    let top = y + 10;

    if (left + rect.width > viewportWidth) {
      left = viewportWidth - rect.width - 10;
    }
    if (top + rect.height > viewportHeight) {
      top = y - rect.height - 10;
    }

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  /**
   * 隐藏划词菜单
   */
  _hideSelectionMenu() {
    if (this.selectionMenu) {
      this.selectionMenu.style.display = 'none';
    }
    this.currentSelection = null;
  }

  /**
   * 使用选中文本提问
   */
  _askAboutSelection(text, prefix = '') {
    if (!text) return;

    this._hideSelectionMenu();

    const message = prefix ? `${prefix}\n\n"${text}"` : text;

    if (!this.isOpen) {
      this.open();
      // 等待 iframe 加载后发送
      setTimeout(() => {
        this.messenger.send('SEND_MESSAGE', { content: message });
      }, 500);
    } else {
      this.messenger.send('SEND_MESSAGE', { content: message });
    }

    // 清除选中
    window.getSelection().removeAllRanges();
  }

  /**
   * 获取历史记录
   */
  _getHistory() {
    if (!this.config.enableHistory) return [];
    try {
      const data = localStorage.getItem(this.config.historyKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[AI Assistant] 读取历史记录失败:', e);
      return [];
    }
  }

  /**
   * 保存历史记录
   */
  _saveHistory(messages) {
    if (!this.config.enableHistory) return;
    try {
      // 限制最大条数
      const limited = messages.slice(-this.config.maxHistory);
      localStorage.setItem(this.config.historyKey, JSON.stringify(limited));
    } catch (e) {
      console.error('[AI Assistant] 保存历史记录失败:', e);
    }
  }

  /**
   * 清空历史记录
   */
  _clearHistory() {
    if (!this.config.enableHistory) return;
    try {
      localStorage.removeItem(this.config.historyKey);
      this.messenger.send('HISTORY_CLEARED', {});
      console.log('[AI Assistant] 历史记录已清空');
    } catch (e) {
      console.error('[AI Assistant] 清空历史记录失败:', e);
    }
  }

  /**
   * 切换历史面板（由 iframe 内部处理）
   */
  _toggleHistoryPanel() {
    this.messenger.send('TOGGLE_HISTORY_PANEL', {});
  }

  /**
   * 表单辅助填写
   * @param {Array} fields 字段数组 [{ selector, value, type }]
   */
  _fillForm(fields) {
    if (!this.config.enableFormFill || !Array.isArray(fields)) return;

    let filledCount = 0;

    fields.forEach(field => {
      try {
        let element = null;

        // 通过多种方式查找元素
        if (field.selector) {
          element = document.querySelector(field.selector);
        }
        if (!element && field.name) {
          element = document.querySelector(`[name="${field.name}"]`) ||
                    document.querySelector(`#${field.name}`);
        }
        if (!element && field.label) {
          // 通过 label 查找
          const labels = document.querySelectorAll('label');
          for (const label of labels) {
            if (label.textContent.includes(field.label)) {
              const forId = label.getAttribute('for');
              if (forId) {
                element = document.getElementById(forId);
              } else {
                element = label.querySelector('input, select, textarea');
              }
              break;
            }
          }
        }

        if (element && field.value !== undefined) {
          const tagName = element.tagName.toLowerCase();
          const inputType = element.type?.toLowerCase();

          if (tagName === 'select') {
            element.value = field.value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (inputType === 'checkbox' || inputType === 'radio') {
            element.checked = !!field.value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            element.value = field.value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }

          // 高亮提示
          this._highlightElement(element);
          filledCount++;
        }
      } catch (e) {
        console.error('[AI Assistant] 填充字段失败:', field, e);
      }
    });

    // 通知 iframe 填充结果
    this.messenger.send('FORM_FILLED', { count: filledCount, total: fields.length });
    console.log(`[AI Assistant] 表单填充完成: ${filledCount}/${fields.length}`);
  }

  /**
   * 高亮元素
   */
  _highlightElement(element) {
    const originalBg = element.style.backgroundColor;
    const originalTransition = element.style.transition;

    element.style.transition = 'background-color 0.3s';
    element.style.backgroundColor = '#bae7ff';

    setTimeout(() => {
      element.style.backgroundColor = originalBg;
      setTimeout(() => {
        element.style.transition = originalTransition;
      }, 300);
    }, 1000);
  }

  _sendPageContext() {
    const context = this.extractor.extract();
    this.messenger.send('PAGE_CONTEXT', {
      ...context,
      token: this.config.token
    });
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.sidebar.classList.add('open');
    this.overlay.classList.add('visible');
    this.toggleBtn.classList.add('hidden');
    this._sendPageContext();
    this.config.onOpen();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.sidebar.classList.remove('open');
    this.overlay.classList.remove('visible');
    this.toggleBtn.classList.remove('hidden');
    this._hideSelectionMenu();
    this.config.onClose();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  destroy() {
    this.toggleBtn?.remove();
    this.sidebar?.remove();
    this.overlay?.remove();
    this.selectionMenu?.remove();
    document.getElementById('ai-assistant-styles')?.remove();
    this.messenger?.destroy();
    console.log('[AI Assistant] SDK 已销毁');
  }

  sendMessage(message) {
    if (!this.isOpen) this.open();
    this.messenger.send('SEND_MESSAGE', { content: message });
  }

  updateContext() {
    this._sendPageContext();
  }

  // 公开 API：手动填充表单
  fillForm(fields) {
    this._fillForm(fields);
  }

  // 公开 API：获取历史记录
  getHistory() {
    return this._getHistory();
  }

  // 公开 API：清空历史
  clearHistory() {
    this._clearHistory();
  }
}

// 自动初始化
(function() {
  const currentScript = document.currentScript;
  if (currentScript) {
    const autoInit = currentScript.dataset.autoInit !== 'false';
    if (autoInit) {
      const init = () => {
        window.aiAssistant = new AIAssistant({
          serverUrl: currentScript.dataset.serverUrl,
          position: currentScript.dataset.position,
          width: currentScript.dataset.width,
          primaryColor: currentScript.dataset.primaryColor,
          token: currentScript.dataset.token,
          autoShow: currentScript.dataset.autoShow === 'true',
          enableSelection: currentScript.dataset.enableSelection !== 'false',
          enableFormFill: currentScript.dataset.enableFormFill !== 'false',
          enableHistory: currentScript.dataset.enableHistory !== 'false'
        });
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    }
  }
  window.AIAssistant = AIAssistant;
})();

export default AIAssistant;
