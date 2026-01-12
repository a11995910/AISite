/**
 * Agent控制器
 * 处理Agent预设的增删改查操作
 */

const { Agent, Model, User } = require('../models');
const { Op } = require('sequelize');
const response = require('../utils/response');

/**
 * 获取Agent列表
 * GET /api/agents
 * 返回企业Agent + 当前用户的个人Agent
 */
const getAgents = async (req, res, next) => {
  try {
    const { type, isActive } = req.query;

    let where = {};

    if (type) {
      where.type = type;
      // 个人Agent只能看自己的
      if (type === 'personal') {
        where.ownerId = req.user.id;
      }
    } else {
      // 没有指定type时，返回企业Agent + 自己的个人Agent
      where = {
        [Op.or]: [
          { type: 'enterprise' },
          { type: 'personal', ownerId: req.user.id }
        ]
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const agents = await Agent.findAll({
      where,
      include: [
        {
          model: Model,
          as: 'model',
          attributes: ['id', 'name', 'modelId', 'type']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name']
        }
      ],
      order: [['type', 'ASC'], ['createdAt', 'DESC']]
    });

    response.success(res, agents, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个Agent
 * GET /api/agents/:id
 */
const getAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findByPk(id, {
      include: [
        {
          model: Model,
          as: 'model'
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!agent) {
      return response.error(res, 'Agent不存在', 404);
    }

    response.success(res, agent, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建Agent
 * POST /api/agents
 */
const createAgent = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      avatar,
      systemPrompt, 
      modelId, 
      type,
      canEditFiles,
      permissionMode,
      workDirectory
    } = req.body;

    if (!name) {
      return response.error(res, 'Agent名称不能为空', 400);
    }

    // 检查模型是否存在
    if (modelId) {
      const model = await Model.findByPk(modelId);
      if (!model) {
        return response.error(res, '模型不存在', 400);
      }
    }

    const agent = await Agent.create({
      name,
      description,
      avatar,
      systemPrompt,
      modelId,
      type: type || 'enterprise',
      ownerId: type === 'personal' ? req.userId : null,
      canEditFiles: canEditFiles || 0,
      permissionMode: permissionMode || 'ask',
      workDirectory
    });

    response.success(res, agent, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 创建个人Agent
 * POST /api/agents/personal
 */
const createPersonalAgent = async (req, res, next) => {
  try {
    const { name, description, avatar, systemPrompt, modelId } = req.body;

    if (!name) {
      return response.error(res, 'Agent名称不能为空', 400);
    }

    // 检查模型是否存在
    if (modelId) {
      const model = await Model.findByPk(modelId);
      if (!model) {
        return response.error(res, '模型不存在', 400);
      }
    }

    const agent = await Agent.create({
      name,
      description,
      avatar,
      systemPrompt,
      modelId,
      type: 'personal',
      ownerId: req.user.id,
      canEditFiles: 0,
      permissionMode: 'ask',
      isActive: 1
    });

    response.success(res, agent, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新Agent
 * PUT /api/agents/:id
 */
const updateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      avatar,
      systemPrompt,
      modelId,
      canEditFiles,
      permissionMode,
      workDirectory,
      isActive
    } = req.body;

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return response.error(res, 'Agent不存在', 404);
    }

    // 权限检查：个人Agent只能所有者修改，企业Agent需要管理员权限
    if (agent.type === 'personal') {
      if (agent.ownerId !== req.user.id) {
        return response.error(res, '无权修改此Agent', 403);
      }
    } else {
      if (req.user.role !== 'admin') {
        return response.error(res, '需要管理员权限', 403);
      }
    }

    // 检查模型是否存在
    if (modelId) {
      const model = await Model.findByPk(modelId);
      if (!model) {
        return response.error(res, '模型不存在', 400);
      }
    }

    await agent.update({
      name: name !== undefined ? name : agent.name,
      description: description !== undefined ? description : agent.description,
      avatar: avatar !== undefined ? avatar : agent.avatar,
      systemPrompt: systemPrompt !== undefined ? systemPrompt : agent.systemPrompt,
      modelId: modelId !== undefined ? modelId : agent.modelId,
      canEditFiles: canEditFiles !== undefined ? canEditFiles : agent.canEditFiles,
      permissionMode: permissionMode !== undefined ? permissionMode : agent.permissionMode,
      workDirectory: workDirectory !== undefined ? workDirectory : agent.workDirectory,
      isActive: isActive !== undefined ? isActive : agent.isActive
    });

    response.success(res, agent, '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除Agent
 * DELETE /api/agents/:id
 */
const deleteAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return response.error(res, 'Agent不存在', 404);
    }

    // 权限检查：个人Agent只能所有者删除，企业Agent需要管理员权限
    if (agent.type === 'personal') {
      if (agent.ownerId !== req.user.id) {
        return response.error(res, '无权删除此Agent', 403);
      }
    } else {
      if (req.user.role !== 'admin') {
        return response.error(res, '需要管理员权限', 403);
      }
    }

    await agent.destroy();
    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 一键生成Agent系统提示词
 * POST /api/agents/generate-prompt
 */
const generateAgentPrompt = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return response.error(res, '请输入助手名称', 400);
    }

    // 获取默认聊天模型配置
    const model = await Model.findOne({
      where: { type: 'chat', isDefault: 1, isActive: 1 },
      include: [{
        model: require('../models').ModelProvider,
        as: 'provider',
        where: { isActive: 1 }
      }]
    });

    if (!model || !model.provider) {
      return response.error(res, '未配置可用的AI模型', 400);
    }

    const apiBase = model.provider.baseUrl;
    const apiKey = model.provider.apiKey;
    const modelName = model.modelId;

    // 调用AI生成提示词
    const fetch = (await import('node-fetch')).default;

    // 使用 AbortController 实现超时控制（node-fetch v3+ 不支持 timeout 参数）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

    try {
      const aiResponse = await fetch(`${apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: `你是一个专业的AI助手设计师。用户需要创建一个AI助手，请根据用户提供的助手名称和描述，生成一个专业、详细的系统提示词(System Prompt)。

要求：
1. 提示词应该清晰定义助手的角色、专业领域和能力边界
2. 包含助手的交流风格和语气
3. 说明助手应该如何处理用户请求
4. 适当添加限制条件防止助手偏离主题
5. 使用中文编写
6. 长度控制在200-500字之间
7. 直接输出提示词内容，不要加任何额外说明或引号`
            },
            {
              role: 'user',
              content: `助手名称：${name}\n${description ? `功能描述：${description}` : '（无描述）'}\n\n请为这个助手生成系统提示词。`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI生成提示词失败:', errorText);
        return response.error(res, 'AI生成失败，请重试', 500);
      }

      const data = await aiResponse.json();
      const generatedPrompt = data.choices?.[0]?.message?.content?.trim();

      if (!generatedPrompt) {
        return response.error(res, '生成结果为空，请重试', 500);
      }

      response.success(res, { prompt: generatedPrompt }, '生成成功');
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('AI生成提示词超时');
        return response.error(res, 'AI服务响应超时，请稍后重试', 504);
      }
      throw fetchError; // 其他错误继续向上抛出
    }
  } catch (error) {
    console.error('生成提示词失败:', error);
    next(error);
  }
};

module.exports = {
  getAgents,
  getAgent,
  createAgent,
  createPersonalAgent,
  updateAgent,
  deleteAgent,
  generateAgentPrompt
};
