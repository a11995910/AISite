/**
 * 数据库初始化脚本
 * 创建数据库并初始化管理员账号和默认数据
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { 
  User, 
  Department, 
  ModelProvider, 
  Model 
} = require('../models');

/**
 * 创建数据库（如果不存在）
 */
const createDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` 
     CHARACTER SET utf8mb4 
     COLLATE utf8mb4_unicode_ci`
  );

  console.log(`✅ 数据库 ${process.env.DB_NAME} 创建成功`);
  await connection.end();
};

/**
 * 初始化默认数据
 */
const initDefaultData = async () => {
  // 创建默认部门
  const [rootDept] = await Department.findOrCreate({
    where: { name: '总公司' },
    defaults: { parentId: null, sortOrder: 0 }
  });

  const [techDept] = await Department.findOrCreate({
    where: { name: '技术部' },
    defaults: { parentId: rootDept.id, sortOrder: 1 }
  });

  const [hrDept] = await Department.findOrCreate({
    where: { name: '人力资源部' },
    defaults: { parentId: rootDept.id, sortOrder: 2 }
  });

  console.log('✅ 默认部门创建成功');

  // 创建管理员账号（password会在模型钩子中自动加密）
  const [admin] = await User.findOrCreate({
    where: { username: 'admin' },
    defaults: {
      password: 'admin123',  // 模型钩子会自动加密
      name: '系统管理员',
      email: 'admin@example.com',
      departmentId: rootDept.id,
      role: 'admin',
      status: 1
    }
  });

  console.log('✅ 管理员账号创建成功');
  console.log('   用户名: admin');
  console.log('   密码: admin123');

  // 创建默认模型服务商
  const [provider] = await ModelProvider.findOrCreate({
    where: { name: '默认服务商' },
    defaults: {
      apiType: 'openai',
      baseUrl: process.env.OPENAI_API_BASE || 'https://api.openai.com',
      apiKey: process.env.OPENAI_API_KEY || 'your-api-key',
      isActive: 1
    }
  });

  console.log('✅ 默认模型服务商创建成功');

  // 创建默认模型
  const [chatModel] = await Model.findOrCreate({
    where: { modelId: process.env.OPENAI_MODEL || 'gpt-3.5-turbo' },
    defaults: {
      providerId: provider.id,
      name: 'GPT-5.2',
      modelId: process.env.OPENAI_MODEL || 'gpt-5.2',
      type: 'chat',
      isDefault: 1,
      maxTokens: 8192,
      description: '默认对话模型',
      isActive: 1
    }
  });

  console.log('✅ 默认模型创建成功');
};

/**
 * 主函数
 */
const main = async () => {
  try {
    console.log('🚀 开始初始化数据库...\n');

    // 创建数据库
    await createDatabase();

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 禁用外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 同步所有模型（force: true 会删除并重建所有表）
    await sequelize.sync({ force: true });
    
    // 恢复外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ 数据表创建成功');

    // 初始化默认数据
    await initDefaultData();

    console.log('\n🎉 数据库初始化完成！\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
};

main();
