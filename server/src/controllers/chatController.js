/**
 * 对话控制器
 * 处理AI对话相关业务逻辑
 */

const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const response = require('../utils/response');
const { Conversation, Message, Model, ModelProvider, UsageLog, SystemSetting } = require('../models');

/**
 * 获取配置的模型信息
 * @param {string} type 模型类型 'chat' | 'image'
 */
const getConfiguredModel = async (type = 'chat') => {
  // 查找默认启用的模型
  const model = await Model.findOne({
    where: {
      type,
      isDefault: 1,
      isActive: 1
    },
    include: [{
      model: ModelProvider,
      as: 'provider',
      where: { isActive: 1 }
    }]
  });

  if (model && model.provider) {
    return {
      id: model.id,
      apiBase: model.provider.baseUrl,
      apiKey: model.provider.apiKey,
      modelName: model.modelId
    };
  }

  // 未配置模型时返回空
  return {
    id: null,
    apiBase: null,
    apiKey: null,
    modelName: null
  };
};

/**
 * 获取搜索API配置
 */
const getSearchApiConfig = async () => {
  try {
    const settings = await SystemSetting.findAll({
      where: { group: 'search' }
    });

    const config = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });

    return config;
  } catch (error) {
    console.error('获取搜索API配置失败:', error);
    return {};
  }
};

/**
 * 记录用量日志
 */
const recordUsage = async (userId, modelId, type, input, output, agentId = null) => {
  try {
    // 简单估算token: 1字符 ≈ 1 token (保守估计)
    const inputTokens = input ? input.length : 0;
    const outputTokens = output ? output.length : 0;
    
    // 图片固定计费，例如1000token/张
    const finalInputTokens = type === 'image' ? 1000 : inputTokens;
    const finalOutputTokens = type === 'image' ? 0 : outputTokens;

    await UsageLog.create({
      userId,
      modelId,
      agentId,
      type,
      inputTokens: finalInputTokens,
      outputTokens: finalOutputTokens,
      totalTokens: finalInputTokens + finalOutputTokens
    });
  } catch (error) {
    console.error('记录用量日志失败:', error);
  }
};

/**
 * 获取对话列表
 * GET /api/chat/conversations
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.findAll({
      where: { userId: req.userId },
      include: [{
        model: require('../models').Agent,
        as: 'agent',
        attributes: ['id', 'name', 'avatar', 'systemPrompt']
      }],
      order: [['updatedAt', 'DESC']],
      limit: 50
    });
    
    response.success(res, conversations, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建新对话
 * POST /api/chat/conversations
 */
const createConversation = async (req, res, next) => {
  try {
    const { title, agentId } = req.body;
    
    const conversation = await Conversation.create({
      userId: req.userId,
      agentId: agentId || null,
      title: title || '新对话'
    });
    
    response.success(res, conversation, '创建成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个对话
 * GET /api/chat/conversations/:id
 */
const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId 
      }
    });
    
    if (!conversation) {
      return response.error(res, '对话不存在', 404);
    }
    
    response.success(res, conversation, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 更新对话
 * PUT /api/chat/conversations/:id
 */
const updateConversation = async (req, res, next) => {
  try {
    const { title } = req.body;
    
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId 
      }
    });
    
    if (!conversation) {
      return response.error(res, '对话不存在', 404);
    }
    
    if (title) {
      conversation.title = title;
    }
    
    await conversation.save();
    
    response.success(res, conversation, '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除对话
 * DELETE /api/chat/conversations/:id
 */
const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId 
      }
    });
    
    if (!conversation) {
      return response.error(res, '对话不存在', 404);
    }
    
    // 删除对话的所有消息
    await Message.destroy({
      where: { conversationId: conversation.id }
    });
    
    // 删除对话
    await conversation.destroy();
    
    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取对话消息
 * GET /api/chat/conversations/:id/messages
 */
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId 
      }
    });
    
    if (!conversation) {
      return response.error(res, '对话不存在', 404);
    }
    
    const messages = await Message.findAll({
      where: { conversationId: conversation.id },
      order: [['createdAt', 'ASC']]
    });
    
    response.success(res, messages, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 发送消息（普通响应）
 * POST /api/chat/conversations/:id/messages
 */
const sendMessage = async (req, res, next) => {
  try {
    const { content, useWeb, knowledgeBaseIds, agentId } = req.body;
    
    if (!content) {
      return response.error(res, '消息内容不能为空', 400);
    }
    
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId 
      }
    });
    
    if (!conversation) {
      return response.error(res, '对话不存在', 404);
    }
    
    // 保存用户消息
    const userMessage = await Message.create({
      conversationId: conversation.id,
      role: 'user',
      content
    });
    
    // 调用AI API获取回复
    const aiResponse = await callAIAPI(content, conversation.id);
    
    // 保存AI回复
    const assistantMessage = await Message.create({
      conversationId: conversation.id,
      role: 'assistant',
      content: aiResponse.content
    });
    
    // 更新对话时间
    await conversation.update({ updatedAt: new Date() });
    
    response.success(res, {
      userMessage,
      assistantMessage,
      suggestions: aiResponse.suggestions
    }, '发送成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 发送消息（流式响应）
 * POST /api/chat/conversations/:id/messages/stream
 */
const sendMessageStream = async (req, res, next) => {
  try {
    const { content, useWeb, searchEngine, knowledgeBaseIds, agentId, mode, files } = req.body;
    
    if (!content) {
      return res.status(400).json({ code: 400, message: '消息内容不能为空' });
    }
    
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId 
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ code: 404, message: '对话不存在' });
    }
    
    // 保存用户消息
    await Message.create({
      conversationId: conversation.id,
      role: 'user',
      content
    });
    
    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    // 获取历史消息构建上下文
    const historyMessages = await Message.findAll({
      where: { conversationId: conversation.id },
      order: [['createdAt', 'ASC']],
      limit: 20
    });
    
    // 构建消息列表
    let messages = historyMessages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    // 处理联网搜索
    let searchResult = null;
    if (useWeb) {
      searchResult = await performWebSearch(content, searchEngine || 'auto');
      if (searchResult && searchResult.context) {
        // 在消息中添加搜索结果上下文
        messages.unshift({
          role: 'system',
          content: `以下是关于用户提问的网络搜索结果，请参考这些信息回答：\n\n${searchResult.context}\n\n请基于以上搜索结果回答用户问题，并在适当位置标注引用来源编号（如[1]、[2]等）。`
        });

        // 立即发送搜索源信息给前端
        res.write(`data: ${JSON.stringify({
          searchInfo: {
            engine: searchResult.engineName,
            sources: searchResult.sources
          }
        })}\n\n`);
      } else if (searchResult && searchResult.error) {
        // 搜索失败，发送错误信息
        res.write(`data: ${JSON.stringify({
          searchInfo: {
            engine: null,
            sources: [],
            error: searchResult.error
          }
        })}\n\n`);
      }
    }
    
    // 处理绘画模式
    if (mode === 'image') {
      const imageResult = await generateImage(res, content, req.user.id, agentId);
      await Message.create({
        conversationId: conversation.id,
        role: 'assistant',
        content: imageResult
      });
      await conversation.update({ updatedAt: new Date() });
      res.write(`data: ${JSON.stringify({ suggestions: ['换个风格', '调整细节', '重新生成'] })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }
    
    // 调用AI API
    let fullContent = '';
    
    // 获取模型配置
    const config = await getConfiguredModel('chat');
    const apiBase = config.apiBase || 'https://api.openai.com';
    const apiKey = config.apiKey;
    const model = config.modelName || 'gpt-4';
    
    // 检查是否配置了API Key
    if (!apiKey || apiKey === 'your-api-key-here') {
      // 使用模拟响应
      fullContent = await sendMockResponse(res, content);
    } else {
      try {
        const fetch = (await import('node-fetch')).default;
        
        // 尝试调用真实API
        const aiResponse = await fetch(`${apiBase}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true
          }),
          timeout: 30000
        });
        
        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`API响应错误: ${aiResponse.status}`, errorText);
          // 尝试解析错误信息
          let errorMsg = `API请求失败 (${aiResponse.status})`;
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.message) {
              errorMsg = errorJson.error.message;
            }
          } catch (e) {
            errorMsg = errorText || errorMsg;
          }
          throw new Error(errorMsg);
        }
        
        // 处理流式响应
        const reader = aiResponse.body;
        const decoder = new (require('util').TextDecoder)();
        
        for await (const chunk of reader) {
          const text = decoder.decode(chunk);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                // 检查多种可能的响应格式
                let delta = parsed.choices?.[0]?.delta?.content;
                
                // 兼容其他API格式
                if (!delta && parsed.content) {
                  delta = parsed.content;
                }
                if (!delta && parsed.message?.content) {
                  delta = parsed.message.content;
                }
                
                if (delta && typeof delta === 'string') {
                  fullContent += delta;
                  res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
                }
              } catch (parseError) {
                // 如果不是JSON格式，尝试直接作为文本处理
                if (data && !data.startsWith('{')) {
                  fullContent += data;
                  res.write(`data: ${JSON.stringify({ content: data })}\n\n`);
                }
              }
            }
          }
        }
        
        // 如果没有获取到内容，使用模拟响应
        if (!fullContent || fullContent.length === 0) {
          console.log('API未返回有效内容，使用模拟响应');
          fullContent = await sendMockResponse(res, content);
        }
        
      } catch (apiError) {
        console.error('AI API调用失败:', apiError.message);
        // 显示真实的错误信息而非演示模式
        const errorMessage = `⚠️ **API 调用失败**\n\n错误信息：${apiError.message}\n\n请检查：\n1. API Key 是否有效或余额是否充足\n2. 模型配置是否正确\n3. 网络连接是否正常\n\n如需帮助，请联系系统管理员。`;
        res.write(`data: ${JSON.stringify({ content: errorMessage })}\n\n`);
        fullContent = errorMessage;
      }
    }
    
    // 保存AI回复
    if (fullContent && fullContent.length > 0) {
      await Message.create({
        conversationId: conversation.id,
        role: 'assistant',
        content: fullContent
      });
      
      // 记录用量日志 (Chat模式)
      if (config.id) {
        await recordUsage(req.user.id, config.id, 'chat', content, fullContent, agentId);
      }
    }
    
    // 更新对话时间和标题
    if (conversation.title === '新对话' && content.length > 0) {
      // 使用AI生成对话标题
      let newTitle = content.slice(0, 20) + (content.length > 20 ? '...' : '');

      try {
        // 如果有API Key，尝试用AI生成标题
        if (apiKey && apiKey !== 'your-api-key-here') {
          const fetch = (await import('node-fetch')).default;
          const titleResponse = await fetch(`${apiBase}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: 'system',
                  content: '请根据用户的提问和AI的回答，生成一个简短的对话标题（10字以内），直接返回标题文字，不要加引号或其他标点。'
                },
                {
                  role: 'user',
                  content: `用户问：${content.slice(0, 200)}\n\nAI答：${fullContent.slice(0, 300)}`
                }
              ],
              max_tokens: 30,
              temperature: 0.7
            }),
            timeout: 10000
          });

          if (titleResponse.ok) {
            const titleData = await titleResponse.json();
            const generatedTitle = titleData.choices?.[0]?.message?.content?.trim();
            if (generatedTitle && generatedTitle.length > 0 && generatedTitle.length <= 30) {
              newTitle = generatedTitle;
            }
          }
        }
      } catch (titleError) {
        console.error('AI生成标题失败，使用默认标题:', titleError.message);
      }

      await conversation.update({
        title: newTitle,
        updatedAt: new Date()
      });

      // 发送新标题给前端
      res.write(`data: ${JSON.stringify({ conversationTitle: newTitle })}\n\n`);
    } else {
      await conversation.update({ updatedAt: new Date() });
    }

    // 生成推荐追问（使用AI动态生成）
    let suggestions = [
      '能详细解释一下吗？',
      '有什么具体的例子吗？',
      '还有其他相关的建议吗？'
    ];

    try {
      if (apiKey && apiKey !== 'your-api-key-here' && fullContent.length > 20) {
        const suggestionResponse = await fetch(`${apiBase}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: '根据用户的问题和AI的回答，生成3个简短的追问建议（每个不超过15字），帮助用户深入了解话题。直接返回3个建议，用|分隔，不要其他内容。'
              },
              {
                role: 'user',
                content: `用户问：${content.slice(0, 200)}\n\nAI答：${fullContent.slice(0, 400)}`
              }
            ],
            max_tokens: 100,
            temperature: 0.8
          })
        });

        if (suggestionResponse.ok) {
          const suggestionData = await suggestionResponse.json();
          const suggestionsText = suggestionData.choices?.[0]?.message?.content?.trim();
          if (suggestionsText) {
            const generatedSuggestions = suggestionsText.split('|').map(s => s.trim()).filter(s => s.length > 0 && s.length <= 20);
            if (generatedSuggestions.length >= 2) {
              suggestions = generatedSuggestions.slice(0, 3);
            }
          }
        }
      }
    } catch (suggestionError) {
      console.error('生成追问建议失败，使用默认建议:', suggestionError.message);
    }

    res.write(`data: ${JSON.stringify({ suggestions })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    
  } catch (error) {
    console.error('流式响应错误:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

/**
 * 发送模拟响应
 * @param {Response} res Express响应对象
 * @param {string} userContent 用户消息内容
 * @returns {string} 完整的响应内容
 */
async function sendMockResponse(res, userContent) {
  const mockResponse = `您好！我是企业AI助手。

关于您的问题：「${userContent}」

目前系统处于演示模式，尚未连接真实的大语言模型API。实际部署时，可以配置以下模型：

**支持的模型服务商**：
- OpenAI (GPT-4, GPT-3.5)
- Azure OpenAI
- 通义千问
- 文心一言
- Claude
- 其他兼容OpenAI API格式的模型

**配置方法**：
在 \`.env\` 文件中设置以下环境变量：
- \`OPENAI_API_BASE\` - API基础地址
- \`OPENAI_API_KEY\` - API密钥
- \`OPENAI_MODEL\` - 模型名称

配置完成后，重启服务即可使用真实的AI对话功能。

如需帮助，请联系系统管理员。`;

  // 模拟打字效果，分段发送
  const segments = mockResponse.split('\n');
  let fullContent = '';
  
  for (const segment of segments) {
    // 发送段落
    fullContent += segment + '\n';
    res.write(`data: ${JSON.stringify({ content: segment + '\n' })}\n\n`);
    await new Promise(r => setTimeout(r, 50));
  }
  
  return fullContent.trim();
}

/**
 * 执行网络搜索
 * @param {string} query 搜索关键词
 * @param {string} engine 搜索引擎类型：tavily/serper/bing/bocha/duckduckgo
 * @returns {object} { context: string, sources: Array, engine: string }
 */
async function performWebSearch(query, engine = 'auto') {
  try {
    const fetch = (await import('node-fetch')).default;
    const currentDate = new Date().toLocaleDateString('zh-CN');

    // 从数据库获取搜索API配置
    const searchConfig = await getSearchApiConfig();

    // 定义搜索引擎优先级（只包含后台可配置的引擎）
    const enginePriority = ['tavily', 'serper', 'bocha', 'bing'];

    // 搜索函数映射，返回 { context, sources, engineName }
    const searchFunctions = {
      // Tavily API
      tavily: async () => {
        const apiKey = searchConfig.tavily_api_key;
        if (!apiKey) return null;

        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: apiKey,
            query: query,
            search_depth: 'basic',
            include_answer: true,
            include_raw_content: false,
            max_results: 8
          }),
          timeout: 15000
        });

        if (response.ok) {
          const data = await response.json();
          const sources = [];
          let contextParts = [];

          if (data.answer) {
            contextParts.push(`【AI摘要】\n${data.answer}`);
          }

          if (data.results?.length > 0) {
            data.results.forEach((r, i) => {
              sources.push({
                index: i + 1,
                title: r.title,
                url: r.url,
                snippet: r.content,
                source: new URL(r.url).hostname.replace('www.', ''),
                date: null
              });
              contextParts.push(`[${i + 1}] ${r.title}\n${r.content}`);
            });
          }

          if (sources.length > 0 || data.answer) {
            return {
              context: contextParts.join('\n\n'),
              sources,
              engineName: 'Tavily'
            };
          }
        }
        return null;
      },

      // Serper API (Google)
      serper: async () => {
        const apiKey = searchConfig.serper_api_key;
        if (!apiKey) return null;

        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: query, gl: 'cn', hl: 'zh-cn', num: 8 }),
          timeout: 10000
        });

        if (response.ok) {
          const data = await response.json();
          const sources = [];
          let contextParts = [];

          if (data.knowledgeGraph?.description) {
            contextParts.push(`【知识图谱】\n${data.knowledgeGraph.description}`);
          }

          if (data.organic?.length > 0) {
            data.organic.forEach((r, i) => {
              sources.push({
                index: i + 1,
                title: r.title,
                url: r.link,
                snippet: r.snippet,
                source: new URL(r.link).hostname.replace('www.', ''),
                date: r.date || null
              });
              contextParts.push(`[${i + 1}] ${r.title}\n${r.snippet}`);
            });
          }

          if (sources.length > 0) {
            return {
              context: contextParts.join('\n\n'),
              sources,
              engineName: 'Google'
            };
          }
        }
        return null;
      },

      // 博查 Bocha API
      bocha: async () => {
        const apiKey = searchConfig.bocha_api_key;
        if (!apiKey) return null;

        const response = await fetch('https://api.bochaai.com/v1/web-search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: query,
            freshness: 'noLimit',
            summary: true,
            count: 8
          }),
          timeout: 15000
        });

        if (response.ok) {
          const data = await response.json();
          const sources = [];
          let contextParts = [];

          if (data.data?.summary) {
            contextParts.push(`【AI摘要】\n${data.data.summary}`);
          }

          if (data.data?.webPages?.value?.length > 0) {
            data.data.webPages.value.forEach((r, i) => {
              sources.push({
                index: i + 1,
                title: r.name,
                url: r.url,
                snippet: r.snippet,
                source: new URL(r.url).hostname.replace('www.', ''),
                date: r.datePublished || null
              });
              contextParts.push(`[${i + 1}] ${r.name}\n${r.snippet}`);
            });
          }

          if (sources.length > 0 || data.data?.summary) {
            return {
              context: contextParts.join('\n\n'),
              sources,
              engineName: '博查'
            };
          }
        }
        return null;
      },

      // Bing Search API
      bing: async () => {
        const apiKey = searchConfig.bing_api_key;
        if (!apiKey) return null;

        const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=8`, {
          headers: { 'Ocp-Apim-Subscription-Key': apiKey },
          timeout: 10000
        });

        if (response.ok) {
          const data = await response.json();
          const results = data.webPages?.value || [];
          const sources = [];
          let contextParts = [];

          results.forEach((r, i) => {
            sources.push({
              index: i + 1,
              title: r.name,
              url: r.url,
              snippet: r.snippet,
              source: new URL(r.url).hostname.replace('www.', ''),
              date: r.datePublished || null
            });
            contextParts.push(`[${i + 1}] ${r.name}\n${r.snippet}`);
          });

          if (sources.length > 0) {
            return {
              context: contextParts.join('\n\n'),
              sources,
              engineName: 'Bing'
            };
          }
        }
        return null;
      },

      // DuckDuckGo
      duckduckgo: async () => {
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, {
          timeout: 10000
        });

        if (response.ok) {
          const data = await response.json();
          const sources = [];
          let contextParts = [];
          let index = 1;

          if (data.Abstract && data.AbstractURL) {
            sources.push({
              index: index,
              title: data.Heading || '摘要',
              url: data.AbstractURL,
              snippet: data.Abstract,
              source: data.AbstractSource || 'Wikipedia',
              date: null
            });
            contextParts.push(`[${index}] ${data.Heading || '摘要'}\n${data.Abstract}`);
            index++;
          }

          if (data.RelatedTopics?.length > 0) {
            data.RelatedTopics.slice(0, 5).filter(t => t.Text && t.FirstURL).forEach(t => {
              sources.push({
                index: index,
                title: t.Text.split(' - ')[0] || '相关',
                url: t.FirstURL,
                snippet: t.Text,
                source: 'DuckDuckGo',
                date: null
              });
              contextParts.push(`[${index}] ${t.Text}`);
              index++;
            });
          }

          if (sources.length > 0) {
            return {
              context: contextParts.join('\n\n'),
              sources,
              engineName: 'DuckDuckGo'
            };
          }
        }
        return null;
      }
    };

    // 根据指定引擎或自动选择进行搜索
    if (engine && engine !== 'auto' && searchFunctions[engine]) {
      try {
        const result = await searchFunctions[engine]();
        if (result) return result;
        // 如果指定引擎失败（未配置key或搜索失败），fallback到其他引擎
        console.log(`${engine}搜索失败，尝试其他引擎`);
      } catch (e) {
        console.error(`${engine}搜索失败:`, e.message);
      }
    }

    // auto模式或指定引擎失败时：按优先级尝试所有引擎
    for (const eng of enginePriority) {
      if (eng === engine) continue; // 跳过已尝试过的引擎
      if (searchFunctions[eng]) {
        try {
          const result = await searchFunctions[eng]();
          if (result) return result;
        } catch (e) {
          console.error(`${eng}搜索失败:`, e.message);
        }
      }
    }

    // 所有搜索方式都失败或未配置时
    return {
      context: '',
      sources: [],
      engineName: null,
      error: '未配置搜索API或搜索服务暂时不可用'
    };

  } catch (error) {
    console.error('网络搜索失败:', error);
    return { context: '', sources: [], engineName: null, error: error.message };
  }
}

/**
 * 生成图片
 * @param {Response} res Express响应对象
 * @param {string} prompt 图片描述
 * @param {number} userId 用户ID
 * @param {number} agentId AgentID
 * @returns {string} 图片结果（Markdown格式）
 */
async function generateImage(res, prompt, userId, agentId) {
  try {
    // 获取图片模型配置
    const config = await getConfiguredModel('image');
    const apiBase = config.apiBase || 'https://api.openai.com';
    const apiKey = config.apiKey;
    const modelName = config.modelName || 'dall-e-3';
    
    // 尝试调用DALL-E API (如果配置了Key)
    if (apiKey && apiKey !== 'your-api-key-here') {
      try {
        const fetch = (await import('node-fetch')).default;
        
        // 兼容不同平台的API路径处理
        // 如果apiBase已经包含了路径，就不再追加
        let url = `${apiBase}/v1/images/generations`;
        if (apiBase.endsWith('/v1')) {
          url = `${apiBase}/images/generations`;
        }

        console.log(`正在调用绘图API: ${url}, 模型: ${modelName}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            prompt: prompt,
            n: 1,
            size: '1024x1024'
          })
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('图片API响应错误:', response.status, errorData);
          throw new Error(`API错误 (${response.status}): ${errorData}`);
        }

        const data = await response.json();
        console.log('图片API响应数据:', JSON.stringify(data).slice(0, 500));
        
        // 兼容多种API响应格式
        let imageUrl = null;
        let isBase64 = false;
        let base64Data = null;
        
        // 格式1: OpenAI/DALL-E 标准格式 { data: [{ url: "..." }] }
        if (data.data?.[0]?.url) {
          imageUrl = data.data[0].url;
        }
        // 格式2: OpenAI base64 格式 { data: [{ b64_json: "..." }] }
        else if (data.data?.[0]?.b64_json) {
          base64Data = data.data[0].b64_json;
          isBase64 = true;
        }
        // 格式3: 某些代理返回 { images: [{ url: "..." }] }
        else if (data.images?.[0]?.url) {
          imageUrl = data.images[0].url;
        }
        // 格式4: 直接返回 { url: "..." }
        else if (data.url) {
          imageUrl = data.url;
        }
        // 格式5: 某些API返回 { image_url: "..." }
        else if (data.image_url) {
          imageUrl = data.image_url;
        }
        // 格式6: 某些API返回 base64 字段
        else if (data.data?.[0]?.base64) {
          base64Data = data.data[0].base64;
          isBase64 = true;
        }
        // 格式7: 直接返回 base64 字符串
        else if (data.base64) {
          base64Data = data.base64;
          isBase64 = true;
        }
        // 格式8: 某些API返回 { artifacts: [{ base64: "..." }] }
        else if (data.artifacts?.[0]?.base64) {
          base64Data = data.artifacts[0].base64;
          isBase64 = true;
        }

        // 如果是base64数据，保存到文件并生成URL
        if (isBase64 && base64Data) {
          try {
            const uploadsDir = path.join(__dirname, '../../uploads/images');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            const fileName = `ai-image-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            const filePath = path.join(uploadsDir, fileName);
            
            // 将base64数据写入文件
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filePath, buffer);
            
            // 生成可访问的URL
            imageUrl = `/uploads/images/${fileName}`;
            console.log('图片已保存到:', filePath, '可访问URL:', imageUrl);
          } catch (fileError) {
            console.error('保存图片文件失败:', fileError);
            // 如果保存失败，回退到base64内联
            imageUrl = `data:image/png;base64,${base64Data}`;
          }
        }

        if (imageUrl) {
          const result = `🎨 **图片已生成**\n\n![${prompt}](${imageUrl})\n\n*提示词: ${prompt}*`;
          res.write(`data: ${JSON.stringify({ content: result })}\n\n`);
          
          // 记录用量日志 (Image模式)
          if (config.id) {
             await recordUsage(userId, config.id, 'image', prompt, imageUrl, agentId);
          }
          
          return result;
        } else {
          console.error('无法解析图片URL，完整响应:', JSON.stringify(data));
          throw new Error('API响应格式不支持，请检查服务商配置');
        }
      } catch (apiError) {
        console.error('图片API调用失败:', apiError);
        // 如果有配置Key但调用失败，直接通过SSE返回错误信息，而不是显示演示模式
        const realErrorMsg = `(图片生成失败) ${apiError.message}`;
        res.write(`data: ${JSON.stringify({ content: realErrorMsg })}\n\n`);
        return realErrorMsg;
      }
    }
    
    // 只有在没有配置Key时，才模拟图片生成响应
    const mockResult = `🎨 **图片生成模式 (演示)**

您的描述：「${prompt}」

目前系统处于演示模式，暂未连接真实的图片生成API。

**支持的图片模型**：
- DALL-E 3
- Stable Diffusion
- Midjourney API

**配置方法**：
在 \`.env\` 文件中确保配置了支持图片生成的API。

生成后的图片将直接显示在对话中。`;

    // 模拟打字效果
    const lines = mockResult.split('\n');
    let fullContent = '';
    for (const line of lines) {
      fullContent += line + '\n';
      res.write(`data: ${JSON.stringify({ content: line + '\n' })}\n\n`);
      await new Promise(r => setTimeout(r, 30));
    }
    
    return fullContent.trim();
    
  } catch (error) {
    console.error('图片生成失败:', error);
    const errorMsg = '抱歉，图片生成失败，请稍后重试。';
    res.write(`data: ${JSON.stringify({ content: errorMsg })}\n\n`);
    return errorMsg;
  }
}

/**
 * 调用AI API
 */
async function callAIAPI(content, conversationId) {
  // 简单模拟AI回复
  return {
    content: `收到您的消息："${content}"。这是AI的回复。`,
    suggestions: ['了解更多', '换个话题', '继续深入']
  };
}

module.exports = {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  sendMessageStream
};
