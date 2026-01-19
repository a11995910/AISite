/**
 * 模型-部门权限关联表
 * 用于实现模型的部门访问控制
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * ModelDepartment 模型
 * 多对多关系中间表，关联 Model 和 Department
 */
const ModelDepartment = sequelize.define('model_departments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  modelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'model_id',
    comment: '模型ID'
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'department_id',
    comment: '部门ID'
  }
}, {
  tableName: 'model_departments',
  comment: '模型部门权限关联表',
  indexes: [
    {
      unique: true,
      fields: ['model_id', 'department_id']
    }
  ]
});

module.exports = ModelDepartment;
