/**
 * 页面内容提取器
 * 智能提取当前页面的主要内容，用于发送给AI分析
 */

export class PageExtractor {
  constructor() {
    // 需要排除的标签
    this.excludeTags = ['script', 'style', 'noscript', 'iframe', 'svg', 'canvas'];
    // 主内容选择器优先级
    this.mainContentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '#content',
      '#main',
      '.article',
      '.post-content',
      '.entry-content',
      '.page-content'
    ];
  }

  /**
   * 提取页面完整上下文
   * @returns {Object} 页面上下文信息
   */
  extract() {
    return {
      url: this._getUrl(),
      title: this._getTitle(),
      description: this._getDescription(),
      keywords: this._getKeywords(),
      content: this._getMainContent(),
      selectedText: this._getSelectedText(),
      metadata: this._getMetadata(),
      structuredData: this._getStructuredData(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取当前URL
   */
  _getUrl() {
    return window.location.href;
  }

  /**
   * 获取页面标题
   */
  _getTitle() {
    // 优先使用 og:title 或 h1
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
    const h1 = document.querySelector('h1')?.innerText;
    return ogTitle || document.title || h1 || '';
  }

  /**
   * 获取页面描述
   */
  _getDescription() {
    return (
      document.querySelector('meta[name="description"]')?.content ||
      document.querySelector('meta[property="og:description"]')?.content ||
      ''
    );
  }

  /**
   * 获取页面关键词
   */
  _getKeywords() {
    const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
    return keywords.split(',').map(k => k.trim()).filter(Boolean);
  }

  /**
   * 获取主要内容
   */
  _getMainContent() {
    // 1. 尝试使用语义化选择器获取主内容区域
    for (const selector of this.mainContentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const content = this._extractTextFromElement(element);
        if (content.length > 100) {
          return this._truncateContent(content);
        }
      }
    }

    // 2. 降级：智能提取 body 内容
    return this._truncateContent(this._extractTextFromElement(document.body));
  }

  /**
   * 从元素中提取文本内容
   * @param {Element} element DOM元素
   * @returns {string} 提取的文本
   */
  _extractTextFromElement(element) {
    if (!element) return '';

    // 克隆节点以避免修改原始DOM
    const clone = element.cloneNode(true);

    // 移除不需要的元素
    this.excludeTags.forEach(tag => {
      clone.querySelectorAll(tag).forEach(el => el.remove());
    });

    // 移除隐藏元素
    clone.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [hidden]')
      .forEach(el => el.remove());

    // 移除导航、侧边栏等非内容区域
    clone.querySelectorAll('nav, aside, header, footer, .sidebar, .navigation, .menu, .advertisement, .ad')
      .forEach(el => el.remove());

    // 获取文本并清理
    let text = clone.innerText || clone.textContent || '';

    // 清理多余空白
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    return text;
  }

  /**
   * 截断内容到合理长度
   * @param {string} content 原始内容
   * @param {number} maxLength 最大长度
   * @returns {string} 截断后的内容
   */
  _truncateContent(content, maxLength = 10000) {
    if (content.length <= maxLength) {
      return content;
    }
    // 在单词边界截断
    return content.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  /**
   * 获取用户选中的文本
   */
  _getSelectedText() {
    const selection = window.getSelection();
    return selection ? selection.toString().trim() : '';
  }

  /**
   * 获取页面元数据
   */
  _getMetadata() {
    const metadata = {};

    // 作者信息
    metadata.author = document.querySelector('meta[name="author"]')?.content || '';

    // 发布时间
    metadata.publishedTime = (
      document.querySelector('meta[property="article:published_time"]')?.content ||
      document.querySelector('time[datetime]')?.getAttribute('datetime') ||
      ''
    );

    // 页面类型
    metadata.type = document.querySelector('meta[property="og:type"]')?.content || 'website';

    // 语言
    metadata.language = document.documentElement.lang || 'zh-CN';

    // 页面图片
    metadata.image = document.querySelector('meta[property="og:image"]')?.content || '';

    return metadata;
  }

  /**
   * 获取结构化数据
   * 提取表格、列表等结构化信息
   */
  _getStructuredData() {
    const data = {};

    // 提取表格
    const tables = document.querySelectorAll('table');
    if (tables.length > 0) {
      data.tables = [];
      tables.forEach((table, index) => {
        if (index < 3) { // 限制最多3个表格
          const tableData = this._extractTableData(table);
          if (tableData.rows.length > 0) {
            data.tables.push(tableData);
          }
        }
      });
    }

    // 提取表单字段（帮助AI理解表单结构）
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
      data.forms = [];
      forms.forEach((form, index) => {
        if (index < 2) {
          data.forms.push(this._extractFormData(form));
        }
      });
    }

    // 提取 JSON-LD 结构化数据
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length > 0) {
      data.jsonLd = [];
      jsonLd.forEach(script => {
        try {
          data.jsonLd.push(JSON.parse(script.textContent));
        } catch (e) {
          // 忽略解析错误
        }
      });
    }

    return data;
  }

  /**
   * 提取表格数据
   * @param {HTMLTableElement} table 表格元素
   */
  _extractTableData(table) {
    const headers = [];
    const rows = [];

    // 提取表头
    const headerCells = table.querySelectorAll('thead th, thead td, tr:first-child th');
    headerCells.forEach(cell => {
      headers.push(cell.innerText.trim());
    });

    // 提取数据行
    const dataRows = table.querySelectorAll('tbody tr, tr');
    dataRows.forEach((row, index) => {
      if (index === 0 && headers.length > 0) return; // 跳过表头行

      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        const rowData = [];
        cells.forEach(cell => {
          rowData.push(cell.innerText.trim());
        });
        rows.push(rowData);
      }
    });

    return {
      headers: headers.length > 0 ? headers : null,
      rows: rows.slice(0, 20) // 限制最多20行
    };
  }

  /**
   * 提取表单数据
   * @param {HTMLFormElement} form 表单元素
   */
  _extractFormData(form) {
    const fields = [];
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      const field = {
        type: input.type || input.tagName.toLowerCase(),
        name: input.name || input.id || '',
        label: this._findInputLabel(input),
        placeholder: input.placeholder || '',
        required: input.required || false
      };

      if (input.tagName === 'SELECT') {
        field.options = Array.from(input.options).map(opt => opt.text);
      }

      fields.push(field);
    });

    return {
      action: form.action || '',
      method: form.method || 'GET',
      fields
    };
  }

  /**
   * 查找输入框对应的标签
   * @param {HTMLInputElement} input 输入框元素
   */
  _findInputLabel(input) {
    // 通过 for 属性查找
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.innerText.trim();
    }

    // 查找父级 label
    const parentLabel = input.closest('label');
    if (parentLabel) {
      return parentLabel.innerText.replace(input.value, '').trim();
    }

    // 查找相邻的 label
    const prevSibling = input.previousElementSibling;
    if (prevSibling?.tagName === 'LABEL') {
      return prevSibling.innerText.trim();
    }

    return '';
  }
}
