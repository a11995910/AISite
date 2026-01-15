/**
 * SDK 样式生成器
 * 生成侧边栏、按钮等组件的CSS样式
 */

/**
 * 创建SDK样式
 * @param {Object} config 配置项
 * @returns {string} CSS样式字符串
 */
export function createStyles(config) {
  const { position, width, primaryColor, zIndex } = config;
  const isRight = position === 'right';

  return `
    /* AI Assistant SDK Styles */

    /* 悬浮按钮 */
    .ai-assistant-btn {
      position: fixed;
      ${isRight ? 'right' : 'left'}: 20px;
      bottom: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: ${zIndex};
      transition: all 0.3s ease;
      border: none;
      outline: none;
    }

    .ai-assistant-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .ai-assistant-btn.hidden {
      transform: scale(0);
      opacity: 0;
      pointer-events: none;
    }

    .ai-assistant-btn svg {
      width: 28px;
      height: 28px;
    }

    /* 侧边栏容器 */
    .ai-assistant-sidebar {
      position: fixed;
      top: 0;
      ${isRight ? 'right' : 'left'}: 0;
      width: ${width};
      max-width: 100vw;
      height: 100vh;
      background: #ffffff;
      box-shadow: ${isRight ? '-4px' : '4px'} 0 20px rgba(0, 0, 0, 0.1);
      z-index: ${zIndex + 1};
      transform: translateX(${isRight ? '100%' : '-100%'});
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .ai-assistant-sidebar.open {
      transform: translateX(0);
    }

    /* 侧边栏头部 */
    .ai-assistant-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: ${primaryColor};
      color: white;
      flex-shrink: 0;
    }

    .ai-assistant-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
    }

    .ai-assistant-title svg {
      opacity: 0.9;
    }

    .ai-assistant-close {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .ai-assistant-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* iframe 容器 */
    .ai-assistant-iframe-container {
      flex: 1;
      overflow: hidden;
      background: #f5f5f5;
    }

    .ai-assistant-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }

    /* 遮罩层 */
    .ai-assistant-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: ${zIndex};
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }

    .ai-assistant-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    /* 移动端适配 */
    @media (max-width: 768px) {
      .ai-assistant-sidebar {
        width: 100vw;
      }

      .ai-assistant-btn {
        width: 48px;
        height: 48px;
        ${isRight ? 'right' : 'left'}: 16px;
        bottom: 16px;
      }

      .ai-assistant-btn svg {
        width: 24px;
        height: 24px;
      }
    }

    /* 暗色模式支持 */
    @media (prefers-color-scheme: dark) {
      .ai-assistant-sidebar {
        background: #1f1f1f;
        box-shadow: ${isRight ? '-4px' : '4px'} 0 20px rgba(0, 0, 0, 0.3);
      }

      .ai-assistant-iframe-container {
        background: #141414;
      }
    }

    /* 头部操作按钮 */
    .ai-assistant-header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .ai-assistant-history-btn,
    .ai-assistant-clear-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
      opacity: 0.8;
    }

    .ai-assistant-history-btn:hover,
    .ai-assistant-clear-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      opacity: 1;
    }

    /* 划词快捷菜单 */
    .ai-selection-menu {
      position: fixed;
      display: none;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 6px;
      z-index: ${zIndex + 2};
      gap: 4px;
    }

    .ai-selection-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: #333;
      cursor: pointer;
      border-radius: 6px;
      font-size: 13px;
      white-space: nowrap;
      transition: background 0.2s, color 0.2s;
    }

    .ai-selection-btn:hover {
      background: ${primaryColor};
      color: white;
    }

    .ai-selection-btn svg {
      opacity: 0.8;
    }

    .ai-selection-btn:hover svg {
      opacity: 1;
    }

    /* 暗色模式划词菜单 */
    @media (prefers-color-scheme: dark) {
      .ai-selection-menu {
        background: #2a2a2a;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      }

      .ai-selection-btn {
        color: #e0e0e0;
      }

      .ai-selection-btn:hover {
        background: ${primaryColor};
        color: white;
      }
    }

    /* 动画 */
    @keyframes ai-assistant-pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .ai-assistant-btn.pulse {
      animation: ai-assistant-pulse 2s infinite;
    }

    /* 表单填充高亮动画 */
    @keyframes ai-form-highlight {
      0% {
        background-color: #bae7ff;
      }
      100% {
        background-color: transparent;
      }
    }
  `;
}
