var AIAssistant=(function(){"use strict";function g(r){const{position:e,width:t,primaryColor:s,zIndex:i}=r,n=e==="right";return`
    /* AI Assistant SDK Styles */

    /* 悬浮按钮 - AI流光风格 */
    .ai-assistant-btn {
      position: fixed;
      ${n?"right":"left"}: 20px;
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      /* 深空极客渐变 */
      background: linear-gradient(to right, #111111 0%, #7c3aed 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      /* 紫色系复合阴影 */
      box-shadow:
        0 8px 20px rgba(124, 58, 237, 0.35),
        0 0 0 1px rgba(255, 255, 255, 0.15) inset;
      z-index: ${i};
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      outline: none;
      /* 呼吸 + 悬浮动画 */
      animation: ai-float 3s ease-in-out infinite;
    }

    .ai-assistant-btn:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow:
        0 15px 30px rgba(124, 58, 237, 0.5),
        0 0 0 2px rgba(255, 255, 255, 0.25) inset;
      animation-play-state: paused;
    }

    .ai-assistant-btn svg {
      width: 32px;
      height: 32px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    /* 悬浮 + 呼吸 组合动画 */
    @keyframes ai-float {
      0%, 100% {
        transform: translateY(0);
        box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
      }
      50% {
        transform: translateY(-10px);
        box-shadow: 0 20px 30px rgba(124, 58, 237, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
      }
    }

    /* 侧边栏容器 */
    .ai-assistant-sidebar {
      position: fixed;
      top: 0;
      ${n?"right":"left"}: 0;
      width: ${t};
      max-width: 100vw;
      height: 100vh;
      background: #ffffff;
      box-shadow: ${n?"-4px":"4px"} 0 20px rgba(0, 0, 0, 0.1);
      z-index: ${i+1};
      transform: translateX(${n?"100%":"-100%"});
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .ai-assistant-sidebar.open {
      transform: translateX(0);
    }

    /* 拖拽调整宽度手柄 */
    .ai-assistant-resize-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: ew-resize;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ai-assistant-resize-right {
      left: 0;
    }

    .ai-assistant-resize-left {
      right: 0;
    }

    .ai-resize-line {
      width: 3px;
      height: 40px;
      background: #d1d5db;
      border-radius: 3px;
      transition: all 0.2s;
      opacity: 0;
    }

    .ai-assistant-resize-handle:hover .ai-resize-line,
    .ai-assistant-resize-handle.active .ai-resize-line {
      opacity: 1;
      background: #7c3aed;
      height: 60px;
    }

    .ai-assistant-resize-handle.active .ai-resize-line {
      background: #7c3aed;
      box-shadow: 0 0 8px rgba(124, 58, 237, 0.4);
    }

    /* 侧边栏头部 */
    .ai-assistant-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      /* 与悬浮球保持一致的深空渐变 */
      background: linear-gradient(to right, #111111 0%, #7c3aed 100%);
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
      z-index: ${i};
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
        ${n?"right":"left"}: 16px;
        bottom: 16px;
      }

      .ai-assistant-btn svg {
        width: 24px;
        height: 24px;
      }
    }

    /* 暗色模式支持 - 已移除 */
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
      z-index: ${i+2};
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
      background: ${s};
      color: white;
    }

    .ai-selection-btn svg {
      opacity: 0.8;
    }

    .ai-selection-btn:hover svg {
      opacity: 1;
    }

    /* 暗色模式划词菜单 - 已移除 */

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
  `}class m{constructor(){this.excludeTags=["script","style","noscript","iframe","svg","canvas"],this.mainContentSelectors=["main","article",'[role="main"]',".main-content",".content","#content","#main",".article",".post-content",".entry-content",".page-content"]}extract(){return{url:this._getUrl(),title:this._getTitle(),description:this._getDescription(),keywords:this._getKeywords(),content:this._getMainContent(),selectedText:this._getSelectedText(),metadata:this._getMetadata(),structuredData:this._getStructuredData(),timestamp:new Date().toISOString()}}_getUrl(){return window.location.href}_getTitle(){var s,i;const e=(s=document.querySelector('meta[property="og:title"]'))==null?void 0:s.content,t=(i=document.querySelector("h1"))==null?void 0:i.innerText;return e||document.title||t||""}_getDescription(){var e,t;return((e=document.querySelector('meta[name="description"]'))==null?void 0:e.content)||((t=document.querySelector('meta[property="og:description"]'))==null?void 0:t.content)||""}_getKeywords(){var t;return(((t=document.querySelector('meta[name="keywords"]'))==null?void 0:t.content)||"").split(",").map(s=>s.trim()).filter(Boolean)}_getMainContent(){for(const e of this.mainContentSelectors){const t=document.querySelector(e);if(t){const s=this._extractTextFromElement(t);if(s.length>100)return this._truncateContent(s)}}return this._truncateContent(this._extractTextFromElement(document.body))}_extractTextFromElement(e){if(!e)return"";const t=e.cloneNode(!0);this.excludeTags.forEach(i=>{t.querySelectorAll(i).forEach(n=>n.remove())}),t.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [hidden]').forEach(i=>i.remove()),t.querySelectorAll("nav, aside, header, footer, .sidebar, .navigation, .menu, .advertisement, .ad").forEach(i=>i.remove());let s=t.innerText||t.textContent||"";return s=s.replace(/\s+/g," ").replace(/\n\s*\n/g,`
`).trim(),s}_truncateContent(e,t=1e4){return e.length<=t?e:e.slice(0,t).replace(/\s+\S*$/,"")+"..."}_getSelectedText(){const e=window.getSelection();return e?e.toString().trim():""}_getMetadata(){var t,s,i,n,a;const e={};return e.author=((t=document.querySelector('meta[name="author"]'))==null?void 0:t.content)||"",e.publishedTime=((s=document.querySelector('meta[property="article:published_time"]'))==null?void 0:s.content)||((i=document.querySelector("time[datetime]"))==null?void 0:i.getAttribute("datetime"))||"",e.type=((n=document.querySelector('meta[property="og:type"]'))==null?void 0:n.content)||"website",e.language=document.documentElement.lang||"zh-CN",e.image=((a=document.querySelector('meta[property="og:image"]'))==null?void 0:a.content)||"",e}_getStructuredData(){const e={},t=document.querySelectorAll("table");t.length>0&&(e.tables=[],t.forEach((n,a)=>{if(a<3){const o=this._extractTableData(n);o.rows.length>0&&e.tables.push(o)}}));const s=document.querySelectorAll("form");s.length>0&&(e.forms=[],s.forEach((n,a)=>{a<2&&e.forms.push(this._extractFormData(n))}));const i=document.querySelectorAll('script[type="application/ld+json"]');return i.length>0&&(e.jsonLd=[],i.forEach(n=>{try{e.jsonLd.push(JSON.parse(n.textContent))}catch{}})),e}_extractTableData(e){const t=[],s=[];return e.querySelectorAll("thead th, thead td, tr:first-child th").forEach(a=>{t.push(a.innerText.trim())}),e.querySelectorAll("tbody tr, tr").forEach((a,o)=>{if(o===0&&t.length>0)return;const l=a.querySelectorAll("td");if(l.length>0){const c=[];l.forEach(d=>{c.push(d.innerText.trim())}),s.push(c)}}),{headers:t.length>0?t:null,rows:s.slice(0,20)}}_extractFormData(e){const t=[];return e.querySelectorAll("input, select, textarea").forEach(i=>{const n={type:i.type||i.tagName.toLowerCase(),name:i.name||i.id||"",label:this._findInputLabel(i),placeholder:i.placeholder||"",required:i.required||!1};i.tagName==="SELECT"&&(n.options=Array.from(i.options).map(a=>a.text)),t.push(n)}),{action:e.action||"",method:e.method||"GET",fields:t}}_findInputLabel(e){if(e.id){const i=document.querySelector(`label[for="${e.id}"]`);if(i)return i.innerText.trim()}const t=e.closest("label");if(t)return t.innerText.replace(e.value,"").trim();const s=e.previousElementSibling;return(s==null?void 0:s.tagName)==="LABEL"?s.innerText.trim():""}}class p{constructor(e,t){this.iframe=e,this.targetOrigin=t||"*",this.handlers=new Map,this._setupListener()}_setupListener(){this._messageHandler=e=>{const{type:t,data:s}=e.data||{};if(!t)return;const i=this.handlers.get(t);i&&i(s)},window.addEventListener("message",this._messageHandler)}on(e,t){this.handlers.set(e,t)}off(e){this.handlers.delete(e)}send(e,t){var s;if(!((s=this.iframe)!=null&&s.contentWindow)){console.warn("[AI Assistant] iframe 未就绪，无法发送消息");return}this.iframe.contentWindow.postMessage({type:e,data:t},this.targetOrigin)}destroy(){window.removeEventListener("message",this._messageHandler),this.handlers.clear()}}class u{constructor(e={}){this.config={serverUrl:e.serverUrl||"http://localhost:5173",position:e.position||"right",width:e.width||"400px",primaryColor:e.primaryColor||"#1677ff",token:e.token||"",buttonIcon:e.buttonIcon||null,autoShow:e.autoShow||!1,zIndex:e.zIndex||99999,enableSelection:e.enableSelection!==!1,enableFormFill:e.enableFormFill!==!1,enableHistory:e.enableHistory!==!1,historyKey:e.historyKey||"ai-assistant-history",maxHistory:e.maxHistory||50,onReady:e.onReady||(()=>{}),onOpen:e.onOpen||(()=>{}),onClose:e.onClose||(()=>{})},this.isOpen=!1,this.iframe=null,this.sidebar=null,this.toggleBtn=null,this.overlay=null,this.selectionMenu=null,this.extractor=new m,this.messenger=null,this.currentSelection=null,this._init()}_init(){this._injectStyles(),this._createToggleButton(),this._createSidebar(),this._createOverlay(),this._createSelectionMenu(),this._setupMessenger(),this._bindEvents(),this.config.autoShow&&setTimeout(()=>this.open(),500),this.config.onReady(),console.log("[AI Assistant] SDK 初始化完成")}_injectStyles(){const e="ai-assistant-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=g(this.config),document.head.appendChild(t)}_createToggleButton(){const e=document.createElement("div");e.id="ai-assistant-btn",e.className="ai-assistant-btn",e.innerHTML=this.config.buttonIcon||`
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M19 11h-1.5c-.4 0-.8-.3-.9-.7l-.8-4.3c-.1-.5-.8-.5-.9 0l-.8 4.3c-.1.4-.5.7-.9.7H12c-.5 0-.5.8 0 .8h1.4c.4 0 .8.3.9.7l.8 4.3c.1.5.8.5.9 0l.8-4.3c.1-.4.5-.7.9-.7H19c.5 0 .5-.8 0-.8zm-8.5-2H9c-.4 0-.8-.3-.9-.7l-1-5.8c-.1-.5-.8-.5-.9 0l-1 5.8c-.1.4-.5.7-.9.7H2.5c-.5 0-.5.8 0 .8H4c.4 0 .8.3.9.7l1 5.8c.1.5.8.5.9 0l1-5.8c.1-.4.5-.7.9-.7h1.5c.5 0 .5-.8 0-.8z"/>
      </svg>
    `,e.title="AI 助手",e.addEventListener("click",()=>this.toggle()),document.body.appendChild(e),this.toggleBtn=e}_createSidebar(){const e=document.createElement("div");e.id="ai-assistant-sidebar",e.className=`ai-assistant-sidebar ai-assistant-sidebar-${this.config.position}`,this.sidebarWidth=parseInt(this.config.width)||400,e.style.width=this.sidebarWidth+"px";const t=document.createElement("div");t.className=`ai-assistant-resize-handle ai-assistant-resize-${this.config.position}`,t.innerHTML='<div class="ai-resize-line"></div>',this._setupResizeHandle(t,e);const s=document.createElement("div");s.className="ai-assistant-header",s.innerHTML=`
      <div class="ai-assistant-title">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19 11h-1.5c-.4 0-.8-.3-.9-.7l-.8-4.3c-.1-.5-.8-.5-.9 0l-.8 4.3c-.1.4-.5.7-.9.7H12c-.5 0-.5.8 0 .8h1.4c.4 0 .8.3.9.7l.8 4.3c.1.5.8.5.9 0l.8-4.3c.1-.4.5-.7.9-.7H19c.5 0 .5-.8 0-.8zm-8.5-2H9c-.4 0-.8-.3-.9-.7l-1-5.8c-.1-.5-.8-.5-.9 0l-1 5.8c-.1.4-.5.7-.9.7H2.5c-.5 0-.5.8 0 .8H4c.4 0 .8.3.9.7l1 5.8c.1.5.8.5.9 0l1-5.8c.1-.4.5-.7.9-.7h1.5c.5 0 .5-.8 0-.8z"/>
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
    `,s.querySelector(".ai-assistant-close").addEventListener("click",()=>this.close()),s.querySelector(".ai-assistant-history-btn").addEventListener("click",()=>this._toggleHistoryPanel()),s.querySelector(".ai-assistant-clear-btn").addEventListener("click",()=>this._clearHistory());const i=document.createElement("div");i.className="ai-assistant-iframe-container",this.iframe=document.createElement("iframe"),this.iframe.src=`${this.config.serverUrl}/embed`,this.iframe.className="ai-assistant-iframe",this.iframe.setAttribute("allow","clipboard-write"),i.appendChild(this.iframe),e.appendChild(t),e.appendChild(s),e.appendChild(i),document.body.appendChild(e),this.sidebar=e}_setupResizeHandle(e,t){let s=!1,i=0,n=0;const a=this.config.position==="right",o=320,l=Math.min(800,window.innerWidth*.8);e.addEventListener("mousedown",c=>{s=!0,i=c.clientX,n=this.sidebarWidth,document.body.style.cursor="ew-resize",document.body.style.userSelect="none",this.iframe.style.pointerEvents="none",e.classList.add("active")}),document.addEventListener("mousemove",c=>{if(!s)return;const d=a?i-c.clientX:c.clientX-i;let h=n+d;h=Math.max(o,Math.min(l,h)),this.sidebarWidth=h,t.style.width=h+"px"}),document.addEventListener("mouseup",()=>{if(s){s=!1,document.body.style.cursor="",document.body.style.userSelect="",this.iframe.style.pointerEvents="",e.classList.remove("active");try{localStorage.setItem("ai-assistant-width",this.sidebarWidth.toString())}catch{}}});try{const c=localStorage.getItem("ai-assistant-width");if(c){const d=parseInt(c);d>=o&&d<=l&&(this.sidebarWidth=d,t.style.width=d+"px")}}catch{}}_createOverlay(){const e=document.createElement("div");e.id="ai-assistant-overlay",e.className="ai-assistant-overlay",e.addEventListener("click",()=>this.close()),document.body.appendChild(e),this.overlay=e}_createSelectionMenu(){if(!this.config.enableSelection)return;const e=document.createElement("div");e.id="ai-assistant-selection-menu",e.className="ai-selection-menu",e.innerHTML=`
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
    `,e.querySelector(".ai-selection-ask").addEventListener("click",()=>{this._askAboutSelection(this.currentSelection)}),e.querySelector(".ai-selection-explain").addEventListener("click",()=>{this._askAboutSelection(this.currentSelection,"请解释以下内容：")}),e.querySelector(".ai-selection-translate").addEventListener("click",()=>{this._askAboutSelection(this.currentSelection,"请翻译以下内容：")}),e.querySelector(".ai-selection-summarize").addEventListener("click",()=>{this._askAboutSelection(this.currentSelection,"请总结以下内容：")}),document.body.appendChild(e),this.selectionMenu=e}_setupMessenger(){this.messenger=new p(this.iframe,this.config.serverUrl),this.messenger.on("REQUEST_PAGE_CONTEXT",()=>{this._sendPageContext()}),this.messenger.on("CLOSE_SIDEBAR",()=>{this.close()}),this.messenger.on("READY",()=>{if(console.log("[AI Assistant] iframe 已就绪"),this.isOpen&&this._sendPageContext(),this.config.enableHistory){const e=this._getHistory();this.messenger.send("LOAD_HISTORY",{messages:e})}}),this.messenger.on("SAVE_HISTORY",e=>{this.config.enableHistory&&e.messages&&this._saveHistory(e.messages)}),this.messenger.on("FILL_FORM",e=>{this.config.enableFormFill&&e.fields&&this._fillForm(e.fields)}),this.messenger.on("CLEAR_HISTORY",()=>{this._clearHistory()})}_bindEvents(){document.addEventListener("keydown",e=>{e.key==="Escape"&&(this.isOpen&&this.close(),this._hideSelectionMenu())}),this.config.enableSelection&&(document.addEventListener("mouseup",e=>{e.target.closest("#ai-assistant-selection-menu")||e.target.closest("#ai-assistant-sidebar")||setTimeout(()=>{const t=window.getSelection().toString().trim();t&&t.length>0&&t.length<1e3?(this.currentSelection=t,this._showSelectionMenu(e.clientX,e.clientY)):this._hideSelectionMenu()},10)}),document.addEventListener("mousedown",e=>{e.target.closest("#ai-assistant-selection-menu")||this._hideSelectionMenu()}))}_showSelectionMenu(e,t){if(!this.selectionMenu)return;const s=this.selectionMenu;s.style.display="flex";const i=s.getBoundingClientRect(),n=window.innerWidth,a=window.innerHeight;let o=e,l=t+10;o+i.width>n&&(o=n-i.width-10),l+i.height>a&&(l=t-i.height-10),s.style.left=`${o}px`,s.style.top=`${l}px`}_hideSelectionMenu(){this.selectionMenu&&(this.selectionMenu.style.display="none"),this.currentSelection=null}_askAboutSelection(e,t=""){if(!e)return;this._hideSelectionMenu();const s=t?`${t}

"${e}"`:e;this.isOpen?this.messenger.send("SEND_MESSAGE",{content:s}):(this.open(),setTimeout(()=>{this.messenger.send("SEND_MESSAGE",{content:s})},500)),window.getSelection().removeAllRanges()}_getHistory(){if(!this.config.enableHistory)return[];try{const e=localStorage.getItem(this.config.historyKey);return e?JSON.parse(e):[]}catch(e){return console.error("[AI Assistant] 读取历史记录失败:",e),[]}}_saveHistory(e){if(this.config.enableHistory)try{const t=e.slice(-this.config.maxHistory);localStorage.setItem(this.config.historyKey,JSON.stringify(t))}catch(t){console.error("[AI Assistant] 保存历史记录失败:",t)}}_clearHistory(){if(this.config.enableHistory)try{localStorage.removeItem(this.config.historyKey),this.messenger.send("HISTORY_CLEARED",{}),console.log("[AI Assistant] 历史记录已清空")}catch(e){console.error("[AI Assistant] 清空历史记录失败:",e)}}_toggleHistoryPanel(){this.messenger.send("TOGGLE_HISTORY_PANEL",{})}_fillForm(e){if(!this.config.enableFormFill||!Array.isArray(e))return;let t=0;e.forEach(s=>{var i;try{let n=null;if(s.selector&&(n=document.querySelector(s.selector)),!n&&s.name&&(n=document.querySelector(`[name="${s.name}"]`)||document.querySelector(`#${s.name}`)),!n&&s.label){const a=document.querySelectorAll("label");for(const o of a)if(o.textContent.includes(s.label)){const l=o.getAttribute("for");l?n=document.getElementById(l):n=o.querySelector("input, select, textarea");break}}if(n&&s.value!==void 0){const a=n.tagName.toLowerCase(),o=(i=n.type)==null?void 0:i.toLowerCase();a==="select"?(n.value=s.value,n.dispatchEvent(new Event("change",{bubbles:!0}))):o==="checkbox"||o==="radio"?(n.checked=!!s.value,n.dispatchEvent(new Event("change",{bubbles:!0}))):(n.value=s.value,n.dispatchEvent(new Event("input",{bubbles:!0}))),this._highlightElement(n),t++}}catch(n){console.error("[AI Assistant] 填充字段失败:",s,n)}}),this.messenger.send("FORM_FILLED",{count:t,total:e.length}),console.log(`[AI Assistant] 表单填充完成: ${t}/${e.length}`)}_highlightElement(e){const t=e.style.backgroundColor,s=e.style.transition;e.style.transition="background-color 0.3s",e.style.backgroundColor="#bae7ff",setTimeout(()=>{e.style.backgroundColor=t,setTimeout(()=>{e.style.transition=s},300)},1e3)}_sendPageContext(){const e=this.extractor.extract();this.messenger.send("PAGE_CONTEXT",{...e,token:this.config.token})}open(){this.isOpen||(this.isOpen=!0,this.sidebar.classList.add("open"),this.overlay.classList.add("visible"),this.toggleBtn.classList.add("hidden"),this._sendPageContext(),this.config.onOpen())}close(){this.isOpen&&(this.isOpen=!1,this.sidebar.classList.remove("open"),this.overlay.classList.remove("visible"),this.toggleBtn.classList.remove("hidden"),this._hideSelectionMenu(),this.config.onClose())}toggle(){this.isOpen?this.close():this.open()}destroy(){var e,t,s,i,n,a;(e=this.toggleBtn)==null||e.remove(),(t=this.sidebar)==null||t.remove(),(s=this.overlay)==null||s.remove(),(i=this.selectionMenu)==null||i.remove(),(n=document.getElementById("ai-assistant-styles"))==null||n.remove(),(a=this.messenger)==null||a.destroy(),console.log("[AI Assistant] SDK 已销毁")}sendMessage(e){this.isOpen||this.open(),this.messenger.send("SEND_MESSAGE",{content:e})}updateContext(){this._sendPageContext()}fillForm(e){this._fillForm(e)}getHistory(){return this._getHistory()}clearHistory(){this._clearHistory()}}return(function(){const r=document.currentScript;if(r&&r.dataset.autoInit!=="false"){const t=()=>{window.aiAssistant=new u({serverUrl:r.dataset.serverUrl,position:r.dataset.position,width:r.dataset.width,primaryColor:r.dataset.primaryColor,token:r.dataset.token,autoShow:r.dataset.autoShow==="true",enableSelection:r.dataset.enableSelection!=="false",enableFormFill:r.dataset.enableFormFill!=="false",enableHistory:r.dataset.enableHistory!=="false"})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t):t()}window.AIAssistant=u})(),u})();
