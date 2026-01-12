/**
 * 错误处理中间件
 * 统一处理应用中的错误
 */

/**
 * 404错误处理
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.path}`,
    data: null
  });
};

/**
 * 全局错误处理
 */
const errorHandler = (err, req, res, next) => {
  console.error('服务器错误:', err);

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: '参数验证失败',
      data: err.errors || null
    });
  }

  // Sequelize唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      code: 400,
      message: '数据已存在，请检查唯一字段',
      data: null
    });
  }

  // Sequelize外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      code: 400,
      message: '关联数据不存在或存在依赖关系',
      data: null
    });
  }

  // 默认服务器错误
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : '服务器内部错误';

  res.status(statusCode).json({
    code: statusCode,
    message,
    data: null
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
