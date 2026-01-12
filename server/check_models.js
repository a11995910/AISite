
const { Model, ModelProvider } = require('./src/models');
const { sequelize } = require('./src/config/database');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const providers = await ModelProvider.findAll();
    console.log('--- 服务商列表 ---');
    console.log(JSON.stringify(providers, null, 2));

    const models = await Model.findAll();
    console.log('--- 模型列表 ---');
    console.log(JSON.stringify(models, null, 2));

    const defaultChatModel = await Model.findOne({
      where: { 
        type: 'chat', 
        isDefault: 1, 
        isActive: 1 
      },
      include: [{
        model: ModelProvider,
        as: 'provider',
        where: { isActive: 1 }
      }]
    });
    console.log('--- 默认对话模型查询结果 ---');
    console.log(JSON.stringify(defaultChatModel, null, 2));

    const defaultImageModel = await Model.findOne({
      where: { 
        type: 'image', 
        isDefault: 1, 
        isActive: 1 
      },
      include: [{
        model: ModelProvider,
        as: 'provider',
        where: { isActive: 1 }
      }]
    });
    console.log('--- 默认绘图模型查询结果 ---');
    console.log(JSON.stringify(defaultImageModel, null, 2));

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await sequelize.close();
  }
})();
