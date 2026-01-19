/**
 * 数据库同步脚本
 * 用于同步新增的模型表结构（ModelDepartment 和 Model.restrictDepartments）
 * 
 * 运行方式：node src/scripts/syncModelDepartment.js
 */

const { sequelize } = require('../config/database');
const { Model, ModelDepartment, Department } = require('../models');

async function sync() {
  try {
    console.log('🔄 开始同步数据库结构...');
    
    // 同步 Model 表（添加新字段）
    await Model.sync({ alter: true });
    console.log('✅ Model 表已更新（添加 restrict_departments 字段）');
    
    // 同步 ModelDepartment 表（创建新表）
    await ModelDepartment.sync({ alter: true });
    console.log('✅ ModelDepartment 表已创建');
    
    console.log('\n🎉 数据库同步完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    process.exit(1);
  }
}

sync();
