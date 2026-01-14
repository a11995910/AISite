/**
 * 统计控制器
 * 处理用量统计和数据分析
 */

const { UsageLog, User, Model, Agent, sequelize } = require('../models');
const { sequelize: db } = require('../config/database');
const response = require('../utils/response');
const { Op, fn, col, literal } = require('sequelize');

/**
 * 获取概览数据
 * GET /api/statistics/overview
 */
const getOverview = async (req, res, next) => {
  try {
    // 今日日期范围
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 统计数据
    const [
      totalUsers,
      totalModels,
      totalAgents,
      todayTokens,
      totalTokens
    ] = await Promise.all([
      User.count({ where: { status: 1 } }),
      Model.count({ where: { isActive: 1 } }),
      Agent.count({ where: { isActive: 1, type: 'enterprise' } }),
      UsageLog.sum('totalTokens', {
        where: {
          createdAt: { [Op.gte]: today, [Op.lt]: tomorrow }
        }
      }),
      UsageLog.sum('totalTokens')
    ]);

    response.success(res, {
      totalUsers,
      totalModels,
      totalAgents,
      todayTokens: todayTokens || 0,
      totalTokens: totalTokens || 0
    }, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用量统计
 * GET /api/statistics/usage
 */
const getUsage = async (req, res, next) => {
  try {
    const { startDate, endDate, userId, modelId } = req.query;

    const where = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (userId) where.userId = userId;
    if (modelId) where.modelId = modelId;

    // 按用户统计
    const userUsage = await UsageLog.findAll({
      where,
      attributes: [
        'userId',
        [fn('SUM', col('usage_logs.input_tokens')), 'inputTokens'],
        [fn('SUM', col('usage_logs.output_tokens')), 'outputTokens'],
        [fn('SUM', col('usage_logs.total_tokens')), 'totalTokens'],
        [fn('COUNT', col('usage_logs.id')), 'requestCount']
      ],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'username']
      }],
      group: ['usage_logs.user_id', 'user.id'],
      order: [[literal('totalTokens'), 'DESC']],
      limit: 10
    });

    // 按模型统计
    const modelUsage = await UsageLog.findAll({
      where,
      attributes: [
        'modelId',
        [fn('SUM', col('usage_logs.total_tokens')), 'totalTokens'],
        [fn('COUNT', col('usage_logs.id')), 'requestCount']
      ],
      include: [{
        model: Model,
        as: 'model',
        attributes: ['id', 'name', 'modelId']
      }],
      group: ['usage_logs.model_id', 'model.id'],
      order: [[literal('totalTokens'), 'DESC']]
    });

    response.success(res, {
      userUsage,
      modelUsage
    }, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取趋势数据
 * GET /api/statistics/trends
 */
const getTrends = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    // 获取最近N天的数据
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const trends = await UsageLog.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('SUM', col('total_tokens')), 'tokens'],
        [fn('COUNT', col('id')), 'requests']
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']]
    });

    // 按类型统计
    const typeDistribution = await UsageLog.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        'type',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total_tokens')), 'tokens']
      ],
      group: ['type']
    });

    response.success(res, {
      trends,
      typeDistribution
    }, '获取成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getUsage,
  getTrends
};
