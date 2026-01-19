/**
 * 模型控制器
 * 处理AI模型的增删改查操作，支持部门权限控制
 */

const { Op } = require('sequelize');
const { Model, ModelProvider, Department, ModelDepartment } = require('../models');
const response = require('../utils/response');

/**
 * 获取模型列表（管理端使用，不过滤权限）
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
      include: [
        {
          model: ModelProvider,
          as: 'provider',
          attributes: ['id', 'name', 'apiType']
        },
        {
          model: Department,
          as: 'departments',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    response.success(res, models, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户可用的模型列表（用户端使用，根据权限过滤）
 * GET /api/models/available
 * @query type - 模型类型：chat/image，排除 embedding
 */
const getAvailableModels = async (req, res, next) => {
  try {
    const { type } = req.query;
    const user = req.user;

    // 只查询启用的模型，排除 embedding 类型
    const where = { 
      isActive: 1,
      type: { [Op.ne]: 'embedding' }
    };
    
    // 如果指定了类型，则按类型过滤
    if (type && ['chat', 'image'].includes(type)) {
      where.type = type;
    }

    const models = await Model.findAll({
      where,
      include: [
        {
          model: ModelProvider,
          as: 'provider',
          attributes: ['id', 'name', 'apiType']
        },
        {
          model: Department,
          as: 'departments',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      order: [['isDefault', 'DESC'], ['name', 'ASC']]
    });

    // 根据权限过滤
    const filteredModels = models.filter(model => {
      // 如果不限制部门，所有人可用
      if (model.restrictDepartments !== 1) {
        return true;
      }
      
      // 如果限制部门，检查用户部门是否在允许列表中
      if (!user || !user.departmentId) {
        return false;
      }
      
      const allowedDeptIds = model.departments.map(d => d.id);
      return allowedDeptIds.includes(user.departmentId);
    });

    // 移除 departments 字段，不暴露给用户端
    const result = filteredModels.map(m => {
      const { departments, ...rest } = m.toJSON();
      return rest;
    });

    response.success(res, result, '获取成功');
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
      include: [
        {
          model: ModelProvider,
          as: 'provider'
        },
        {
          model: Department,
          as: 'departments',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
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
      description,
      restrictDepartments,
      departmentIds
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
      description,
      restrictDepartments: restrictDepartments ? 1 : 0
    });

    // 如果限制部门，保存部门权限
    if (restrictDepartments && departmentIds && departmentIds.length > 0) {
      const deptRecords = departmentIds.map(deptId => ({
        modelId: model.id,
        departmentId: deptId
      }));
      await ModelDepartment.bulkCreate(deptRecords);
    }

    // 重新获取模型信息（包含关联）
    const createdModel = await Model.findByPk(model.id, {
      include: [
        { model: ModelProvider, as: 'provider', attributes: ['id', 'name'] },
        { model: Department, as: 'departments', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });

    response.success(res, createdModel, '创建成功', 201);
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
      isActive,
      restrictDepartments,
      departmentIds
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
      isActive: isActive !== undefined ? isActive : model.isActive,
      restrictDepartments: restrictDepartments !== undefined ? (restrictDepartments ? 1 : 0) : model.restrictDepartments
    });

    // 更新部门权限
    if (restrictDepartments !== undefined) {
      // 先删除现有权限
      await ModelDepartment.destroy({ where: { modelId: id } });
      
      // 如果限制部门且有部门列表，添加新权限
      if (restrictDepartments && departmentIds && departmentIds.length > 0) {
        const deptRecords = departmentIds.map(deptId => ({
          modelId: parseInt(id),
          departmentId: deptId
        }));
        await ModelDepartment.bulkCreate(deptRecords);
      }
    }

    // 重新获取模型信息（包含关联）
    const updatedModel = await Model.findByPk(id, {
      include: [
        { model: ModelProvider, as: 'provider', attributes: ['id', 'name'] },
        { model: Department, as: 'departments', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });

    response.success(res, updatedModel, '更新成功');
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

    // 删除权限关联（级联删除会自动处理，但为保险起见手动删除）
    await ModelDepartment.destroy({ where: { modelId: id } });
    
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
  getAvailableModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,
  setDefault,
  getDefaults
};
