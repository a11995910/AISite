/**
 * 系统设置控制器
 * 处理系统配置相关业务逻辑
 */

const response = require('../utils/response');
const { SystemSetting } = require('../models');

/**
 * 获取所有设置
 * GET /api/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const { group } = req.query;

    const where = {};
    if (group) {
      where.group = group;
    }

    const settings = await SystemSetting.findAll({
      where,
      order: [['group', 'ASC'], ['key', 'ASC']]
    });

    // 转换为键值对格式
    const settingsMap = {};
    settings.forEach(s => {
      let value = s.value;
      // 根据类型转换值
      if (s.type === 'number') {
        value = Number(value);
      } else if (s.type === 'boolean') {
        value = value === 'true' || value === '1';
      } else if (s.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = null;
        }
      }
      settingsMap[s.key] = {
        value,
        type: s.type,
        group: s.group,
        description: s.description
      };
    });

    response.success(res, settingsMap, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个设置
 * GET /api/settings/:key
 */
const getSetting = async (req, res, next) => {
  try {
    const setting = await SystemSetting.findOne({
      where: { key: req.params.key }
    });

    if (!setting) {
      return response.error(res, '设置不存在', 404);
    }

    response.success(res, setting, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 批量更新设置
 * PUT /api/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return response.error(res, '设置数据格式错误', 400);
    }

    // 批量更新或创建设置
    for (const [key, data] of Object.entries(settings)) {
      let value = data.value;
      const type = data.type || 'string';
      const group = data.group || 'general';
      const description = data.description || '';

      // 将值转换为字符串存储
      if (type === 'json' && typeof value === 'object') {
        value = JSON.stringify(value);
      } else if (value !== null && value !== undefined) {
        value = String(value);
      }

      await SystemSetting.upsert({
        key,
        value,
        type,
        group,
        description
      });
    }

    response.success(res, null, '设置更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 更新单个设置
 * PUT /api/settings/:key
 */
const updateSetting = async (req, res, next) => {
  try {
    const { value, type, group, description } = req.body;
    const key = req.params.key;

    let storedValue = value;
    if (type === 'json' && typeof value === 'object') {
      storedValue = JSON.stringify(value);
    } else if (value !== null && value !== undefined) {
      storedValue = String(value);
    }

    const [setting, created] = await SystemSetting.upsert({
      key,
      value: storedValue,
      type: type || 'string',
      group: group || 'general',
      description: description || ''
    });

    response.success(res, setting, created ? '设置创建成功' : '设置更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除设置
 * DELETE /api/settings/:key
 */
const deleteSetting = async (req, res, next) => {
  try {
    const result = await SystemSetting.destroy({
      where: { key: req.params.key }
    });

    if (result === 0) {
      return response.error(res, '设置不存在', 404);
    }

    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取搜索API配置（内部使用）
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
 * 获取可用的搜索引擎列表（公开API）
 * GET /api/settings/search-engines
 * 只返回后台已配置API key的搜索引擎
 */
const getAvailableSearchEngines = async (req, res, next) => {
  try {
    const settings = await SystemSetting.findAll({
      where: { group: 'search' }
    });

    // 搜索引擎配置映射（按优先级排序，tavily在最前）
    const engineConfig = {
      tavily_api_key: { key: 'tavily', label: 'Tavily (AI搜索)', icon: '🤖', priority: 1 },
      serper_api_key: { key: 'serper', label: 'Google搜索', icon: '🔍', priority: 2 },
      bocha_api_key: { key: 'bocha', label: '博查 (国内)', icon: '🇨🇳', priority: 3 },
      bing_api_key: { key: 'bing', label: 'Bing搜索', icon: '🅱️', priority: 4 }
    };

    // 只添加已配置API key的引擎
    const availableEngines = [];

    settings.forEach(s => {
      if (s.value && s.value.trim() && engineConfig[s.key]) {
        availableEngines.push(engineConfig[s.key]);
      }
    });

    // 按优先级排序，tavily在最前
    availableEngines.sort((a, b) => a.priority - b.priority);

    // 移除priority字段
    const result = availableEngines.map(({ key, label, icon }) => ({ key, label, icon }));

    response.success(res, result, '获取成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  getSetting,
  updateSettings,
  updateSetting,
  deleteSetting,
  getSearchApiConfig,
  getAvailableSearchEngines
};
