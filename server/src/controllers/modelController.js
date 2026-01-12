/**
 * 模型控制器
 * 处理AI模型的增删改查操作
 */

const { Model, ModelProvider } = require('../models');
const response = require('../utils/response');

/**
 * 获取模型列表
 * GET /api/models
 */
const getModels = async (req, res, next) => {
  try {
    const { providerId, type, isActive } = req.query;
    
    const where = {};
    if (providerId) where.providerId = providerId;
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    const models = await Model.findAll({
      where,
      include: [{
        model: ModelProvider,
        as: 'provider',
        attributes: ['id', 'name', 'apiType']
      }],
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    response.success(res, models, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个模型
 * GET /api/models/:id
 */
const getModel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id, {
      include: [{
        model: ModelProvider,
        as: 'provider'
      }]
    });

    if (!model) {
      return response.error(res, '模型不存在', 404);
    }

    response.success(res, model, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建模型
 * POST /api/models
 */
const createModel = async (req, res, next) => {
  try {
    const { 
      providerId, 
      name, 
      modelId, 
      type, 
      maxTokens, 
      description 
    } = req.body;

    if (!providerId || !name || !modelId || !type) {
      return response.error(res, '请填写完整的模型信息', 400);
    }

    // 检查服务商是否存在
    const provider = await ModelProvider.findByPk(providerId);
    if (!provider) {
      return response.error(res, '服务商不存在', 400);
    }

    const validTypes = ['chat', 'image', 'embedding'];
    if (!validTypes.includes(type)) {
      return response.error(res, '模型类型不支持', 400);
    }

    const model = await Model.create({
      providerId,
      name,
      modelId,
      type,
      maxTokens: maxTokens || 4096,
      description
    });

    response.success(res, model, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新模型
 * PUT /api/models/:id
 */
const updateModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      providerId,
      name, 
      modelId, 
      type, 
      maxTokens, 
      description, 
      isActive 
    } = req.body;

    const model = await Model.findByPk(id);
    if (!model) {
      return response.error(res, '模型不存在', 404);
    }

    // 如果要更新服务商，检查服务商是否存在
    if (providerId !== undefined && providerId !== model.providerId) {
      const provider = await ModelProvider.findByPk(providerId);
      if (!provider) {
        return response.error(res, '服务商不存在', 400);
      }
    }

    await model.update({
      providerId: providerId !== undefined ? providerId : model.providerId,
      name: name !== undefined ? name : model.name,
      modelId: modelId !== undefined ? modelId : model.modelId,
      type: type !== undefined ? type : model.type,
      maxTokens: maxTokens !== undefined ? maxTokens : model.maxTokens,
      description: description !== undefined ? description : model.description,
      isActive: isActive !== undefined ? isActive : model.isActive
    });

    response.success(res, model, '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除模型
 * DELETE /api/models/:id
 */
const deleteModel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      return response.error(res, '模型不存在', 404);
    }

    await model.destroy();
    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 设为默认模型
 * PUT /api/models/:id/default
 */
const setDefault = async (req, res, next) => {
  try {
    const { id } = req.params;

    const model = await Model.findByPk(id);
    if (!model) {
      return response.error(res, '模型不存在', 404);
    }

    // 取消同类型其他模型的默认状态
    await Model.update(
      { isDefault: 0 },
      { where: { type: model.type } }
    );

    // 设置当前模型为默认
    await model.update({ isDefault: 1 });

    response.success(res, model, '设置成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取默认模型
 * GET /api/models/defaults
 */
const getDefaults = async (req, res, next) => {
  try {
    const chatModel = await Model.findOne({
      where: { type: 'chat', isDefault: 1, isActive: 1 },
      include: [{ model: ModelProvider, as: 'provider' }]
    });

    const imageModel = await Model.findOne({
      where: { type: 'image', isDefault: 1, isActive: 1 },
      include: [{ model: ModelProvider, as: 'provider' }]
    });

    response.success(res, {
      chat: chatModel,
      image: imageModel
    }, '获取成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,
  setDefault,
  getDefaults
};
