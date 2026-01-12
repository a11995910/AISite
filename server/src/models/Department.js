/**
 * 部门模型
 * 支持树状层级结构
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('departments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '部门ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '部门名称'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    comment: '父部门ID'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
    comment: '排序'
  }
}, {
  tableName: 'departments',
  comment: '部门表'
});

// 自关联：部门树结构
Department.hasMany(Department, { as: 'children', foreignKey: 'parentId' });
Department.belongsTo(Department, { as: 'parent', foreignKey: 'parentId' });

module.exports = Department;
