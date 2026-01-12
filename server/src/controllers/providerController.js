/**
 * 模型服务商控制器
 * 处理模型服务商的增删改查操作
 */

const { ModelProvider, Model } = require('../models');
const response = require('../utils/response');

/**
 * 获取服务商列表
 * GET /api/providers
 */
const getProviders = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const providers = await ModelProvider.findAll({
      where,
      include: [{
        model: Model,
        as: 'models',
        attributes: ['id', 'name', 'modelId', 'type', 'isActive']
      }],
      order: [['createdAt', 'DESC']]
    });

    response.success(res, providers, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个服务商
 * GET /api/providers/:id
 */
const getProvider = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await ModelProvider.findByPk(id, {
      include: [{
        model: Model,
        as: 'models'
      }]
    });

    if (!provider) {
      return response.error(res, '服务商不存在', 404);
    }

    response.success(res, provider, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建服务商
 * POST /api/providers
 */
const createProvider = async (req, res, next) => {
  try {
    const { name, apiType, baseUrl, apiKey } = req.body;

    if (!name || !apiType || !baseUrl || !apiKey) {
      return response.error(res, '请填写完整的服务商信息', 400);
    }

    const validTypes = ['openai', 'claude', 'gemini', 'custom'];
    if (!validTypes.includes(apiType)) {
      return response.error(res, 'API类型不支持', 400);
    }

    const provider = await ModelProvider.create({
      name,
      apiType,
      baseUrl,
      apiKey
    });

    response.success(res, provider, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新服务商
 * PUT /api/providers/:id
 */
const updateProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, apiType, baseUrl, apiKey, isActive } = req.body;

    const provider = await ModelProvider.findByPk(id);
    if (!provider) {
      return response.error(res, '服务商不存在', 404);
    }

    await provider.update({
      name: name !== undefined ? name : provider.name,
      apiType: apiType !== undefined ? apiType : provider.apiType,
      baseUrl: baseUrl !== undefined ? baseUrl : provider.baseUrl,
      apiKey: apiKey !== undefined ? apiKey : provider.apiKey,
      isActive: isActive !== undefined ? isActive : provider.isActive
    });

    response.success(res, provider, '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除服务商
 * DELETE /api/providers/:id
 */
const deleteProvider = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await ModelProvider.findByPk(id);
    if (!provider) {
      return response.error(res, '服务商不存在', 404);
    }

    // 检查是否有关联的模型
    const modelCount = await Model.count({ where: { providerId: id } });
    if (modelCount > 0) {
      return response.error(res, '请先删除该服务商下的模型', 400);
    }

    await provider.destroy();
    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider
};
