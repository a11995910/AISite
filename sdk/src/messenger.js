/**
 * 消息通信模块
 * 处理 SDK 与 iframe 之间的 postMessage 通信
 */

export class Messenger {
  /**
   * @param {HTMLIFrameElement} iframe iframe元素
   * @param {string} targetOrigin 目标源
   */
  constructor(iframe, targetOrigin) {
    this.iframe = iframe;
    this.targetOrigin = targetOrigin || '*';
    this.handlers = new Map();
    this._setupListener();
  }

  /**
   * 设置消息监听器
   */
  _setupListener() {
    this._messageHandler = (event) => {
      // 验证来源（生产环境应该严格检查）
      // if (event.origin !== this.targetOrigin) return;

      const { type, data } = event.data || {};
      if (!type) return;

      // 触发对应的处理器
      const handler = this.handlers.get(type);
      if (handler) {
        handler(data);
      }
    };

    window.addEventListener('message', this._messageHandler);
  }

  /**
   * 注册消息处理器
   * @param {string} type 消息类型
   * @param {Function} handler 处理函数
   */
  on(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * 移除消息处理器
   * @param {string} type 消息类型
   */
  off(type) {
    this.handlers.delete(type);
  }

  /**
   * 发送消息到 iframe
   * @param {string} type 消息类型
   * @param {any} data 消息数据
   */
  send(type, data) {
    if (!this.iframe?.contentWindow) {
      console.warn('[AI Assistant] iframe 未就绪，无法发送消息');
      return;
    }

    this.iframe.contentWindow.postMessage(
      { type, data },
      this.targetOrigin
    );
  }

  /**
   * 销毁消息监听
   */
  destroy() {
    window.removeEventListener('message', this._messageHandler);
    this.handlers.clear();
  }
}
