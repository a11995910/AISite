const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function updateSchema() {
  try {
    console.log('开始更新数据库表结构...');

    // 1. 检查 usage_logs 表是否存在 source 列
    const tableDescription = await sequelize.getQueryInterface().describeTable('usage_logs');

    if (!tableDescription.source) {
      console.log('正在添加 source 列到 usage_logs 表...');
      await sequelize.getQueryInterface().addColumn('usage_logs', 'source', {
        type: 'VARCHAR(20)',
        defaultValue: 'web',
        allowNull: false,
        comment: '来源: web/sdk'
      });
      console.log('✅ source 列添加成功');
    } else {
      console.log('ℹ️ source 列已存在');
    }

    // 2. 修改 user_id 列允许为空
    // 注意：Sequelize 的 changeColumn 在某些数据库方言中可能支持不完善，这里使用原生 SQL 确保兼容性
    console.log('正在修改 user_id 列允许为空...');
    try {
      // MySQL 语法
      await sequelize.query(
        'ALTER TABLE usage_logs MODIFY COLUMN user_id INTEGER NULL COMMENT "用户ID";',
        { type: QueryTypes.RAW }
      );
      console.log('✅ user_id 列修改成功');
    } catch (error) {
      console.error('⚠️ 修改 user_id 列失败 (可能已是 NULL 或语法不支持):', error.message);
    }

    console.log('🎉 数据库结构更新完成');
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await sequelize.close();
  }
}

updateSchema();
