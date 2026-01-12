/**
 * 用户模型
 * 包含员工基本信息和权限设置
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名/钉钉工号'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '真实姓名'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '邮箱'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像URL'
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'department_id',
    comment: '部门ID'
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
    comment: '角色：admin管理员 user普通用户'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1启用 0禁用'
  },
  dingtalkId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'dingtalk_id',
    comment: '钉钉ID'
  }
}, {
  tableName: 'users',
  comment: '用户表',
  hooks: {
    // 创建用户前加密密码
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    // 更新用户时加密密码
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

/**
 * 验证密码
 * @param {string} password 待验证密码
 * @returns {Promise<boolean>} 是否匹配
 */
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

/**
 * 转换为JSON时隐藏密码
 */
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
