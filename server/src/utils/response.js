/**
 * 统一响应工具类
 * 提供标准化的API响应格式
 */

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {any} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} code - 状态码
 */
const success = (res, data = null, message = '操作成功', code = 200) => {
  res.status(code).json({
    code,
    message,
    data
  });
};

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} code - 状态码
 * @param {any} data - 额外数据
 */
const error = (res, message = '操作失败', code = 400, data = null) => {
  res.status(code).json({
    code,
    message,
    data
  });
};

/**
 * 分页响应
 * @param {Object} res - Express响应对象
 * @param {Array} list - 数据列表
 * @param {number} total - 总数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页数量
 * @param {string} message - 响应消息
 */
const paginate = (res, list, total, page, pageSize, message = '获取成功') => {
  res.status(200).json({
    code: 200,
    message,
    data: {
      list,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    }
  });
};

module.exports = {
  success,
  error,
  paginate
};
