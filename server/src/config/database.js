/**
 * 数据库配置文件
 * 使用Sequelize ORM连接MySQL数据库
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建Sequelize实例
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+08:00', // 北京时间
    define: {
      timestamps: true, // 自动添加 createdAt 和 updatedAt
      underscored: true, // 使用下划线命名
      freezeTableName: true // 禁止表名复数化
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

/**
 * 测试数据库连接
 * @returns {Promise<boolean>} 连接是否成功
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
