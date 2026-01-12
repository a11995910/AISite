/**
 * 认证控制器
 * 处理用户登录、登出和个人信息获取
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User, Department } = require('../models');
const response = require('../utils/response');

/**
 * 用户登录
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return response.error(res, '用户名和密码不能为空', 400);
    }

    // 查询用户
    const user = await User.findOne({
      where: { username },
      include: [{ model: Department, as: 'department' }]
    });

    if (!user) {
      return response.error(res, '用户名或密码错误', 401);
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return response.error(res, '用户名或密码错误', 401);
    }

    // 检查账号状态
    if (user.status !== 1) {
      return response.error(res, '账号已被禁用', 403);
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    response.success(res, {
      token,
      tokenType: jwtConfig.tokenType,
      expiresIn: jwtConfig.expiresIn,
      user: user.toJSON()
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登出
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // JWT是无状态的，客户端删除token即可
    // 如需实现黑名单机制，可在此添加
    response.success(res, null, '登出成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前用户信息
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{ model: Department, as: 'department' }]
    });

    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    response.success(res, user.toJSON(), '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 修改密码
 * PUT /api/auth/password
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return response.error(res, '请提供旧密码和新密码', 400);
    }

    if (newPassword.length < 6) {
      return response.error(res, '新密码长度不能少于6位', 400);
    }

    const user = await User.findByPk(req.userId);
    
    // 验证旧密码
    const isValid = await user.validatePassword(oldPassword);
    if (!isValid) {
      return response.error(res, '旧密码错误', 400);
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    response.success(res, null, '密码修改成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 用户注册
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, password, name, departmentId, phone, email } = req.body;

    // 参数验证
    if (!username || !password) {
      return response.error(res, '用户名和密码不能为空', 400);
    }

    if (password.length < 6) {
      return response.error(res, '密码长度不能少于6位', 400);
    }

    if (!name) {
      return response.error(res, '姓名不能为空', 400);
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return response.error(res, '用户名已被注册', 400);
    }

    // 创建用户
    const user = await User.create({
      username,
      password,
      name,
      departmentId: departmentId || null,
      phone: phone || null,
      email: email || null,
      role: 'user',  // 普通员工角色
      status: 1       // 默认启用
    });

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // 获取完整用户信息
    const fullUser = await User.findByPk(user.id, {
      include: [{ model: Department, as: 'department' }]
    });

    response.success(res, {
      token,
      tokenType: jwtConfig.tokenType,
      expiresIn: jwtConfig.expiresIn,
      user: fullUser.toJSON()
    }, '注册成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取部门列表（公开接口，用于注册）
 * GET /api/auth/departments
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      order: [['name', 'ASC']]
    });
    
    response.success(res, departments, '获取成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  changePassword,
  register,
  getDepartments
};
