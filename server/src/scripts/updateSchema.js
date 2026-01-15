const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

async function updateSchema() {
  try {
    const queryInterface = sequelize.getQueryInterface();

    console.log('🔄 开始更新数据库结构...');

    // 1. 添加 source 列
    try {
      const tableInfo = await queryInterface.describeTable('usage_logs');
      if (!tableInfo.source) {
        await queryInterface.addColumn('usage_logs', 'source', {
          type: DataTypes.STRING(20),
          defaultValue: 'web',
          allowNull: false,
          comment: '来源: web/sdk'
        });
        console.log('✅ 添加 source 列成功');
      } else {
        console.log('ℹ️ source 列已存在');
      }
    } catch (e) {
      console.error('❌ 添加 source 列失败:', e.message);
    }

    // 2. 修改 user_id 为可为空 (支持匿名SDK使用)
    try {
      await queryInterface.changeColumn('usage_logs', 'user_id', {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '用户ID'
      });
      console.log('✅ 修改 user_id 为可为空成功');
    } catch (e) {
      console.error('❌ 修改 user_id 失败:', e.message);
    }

    console.log('✨ 数据库结构更新完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  }
}

updateSchema();
