/**
 * 用户控制器
 * 处理用户的增删改查操作
 */

const { User, Department } = require('../models');
const response = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 获取用户列表
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      keyword, 
      departmentId, 
      role, 
      status 
    } = req.query;

    // 构建查询条件
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (departmentId) {
      where.departmentId = departmentId;
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status !== undefined) {
      where.status = status;
    }

    const offset = (page - 1) * pageSize;
    
    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Department, as: 'department' }],
      offset,
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']]
    });

    response.paginate(res, rows, count, page, pageSize);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个用户
 * GET /api/users/:id
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{ model: Department, as: 'department' }]
    });

    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    response.success(res, user, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建用户
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { 
      username, 
      password, 
      name, 
      email, 
      phone, 
      departmentId, 
      role,
      dingtalkId 
    } = req.body;

    // 参数验证
    if (!username || !password || !name) {
      return response.error(res, '用户名、密码和姓名不能为空', 400);
    }

    // 检查用户名是否已存在
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return response.error(res, '用户名已存在', 400);
    }

    // 检查部门是否存在
    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (!dept) {
        return response.error(res, '部门不存在', 400);
      }
    }

    const user = await User.create({
      username,
      password,
      name,
      email,
      phone,
      departmentId,
      role: role || 'user',
      dingtalkId
    });

    response.success(res, user.toJSON(), '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新用户
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      departmentId, 
      role, 
      status,
      dingtalkId,
      avatar
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    // 检查部门是否存在
    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (!dept) {
        return response.error(res, '部门不存在', 400);
      }
    }

    await user.update({
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
      phone: phone !== undefined ? phone : user.phone,
      departmentId: departmentId !== undefined ? departmentId : user.departmentId,
      role: role !== undefined ? role : user.role,
      status: status !== undefined ? status : user.status,
      dingtalkId: dingtalkId !== undefined ? dingtalkId : user.dingtalkId,
      avatar: avatar !== undefined ? avatar : user.avatar
    });

    response.success(res, user.toJSON(), '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除用户
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 不能删除自己
    if (parseInt(id) === req.userId) {
      return response.error(res, '不能删除自己', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    await user.destroy();
    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 重置用户密码
 * PUT /api/users/:id/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return response.error(res, '密码长度不能少于6位', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    user.password = password;
    await user.save();

    response.success(res, null, '密码重置成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
};
