/**
 * 部门控制器
 * 处理部门的增删改查操作
 */

const { Department, User } = require('../models');
const response = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 获取部门树
 * GET /api/departments
 */
const getDepartmentTree = async (req, res, next) => {
  try {
    // 获取所有部门
    const departments = await Department.findAll({
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      include: [{
        model: User,
        as: 'users',
        attributes: ['id', 'name', 'username']
      }]
    });

    // 构建树形结构
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item.toJSON(),
          children: buildTree(items, item.id)
        }));
    };

    const tree = buildTree(departments);
    response.success(res, tree, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取部门列表（平铺）
 * GET /api/departments/list
 */
const getDepartmentList = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      include: [{
        model: Department,
        as: 'parent',
        attributes: ['id', 'name']
      }]
    });

    response.success(res, departments, '获取成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建部门
 * POST /api/departments
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, parentId, sortOrder } = req.body;

    if (!name) {
      return response.error(res, '部门名称不能为空', 400);
    }

    // 检查父部门是否存在
    if (parentId) {
      const parent = await Department.findByPk(parentId);
      if (!parent) {
        return response.error(res, '父部门不存在', 400);
      }
    }

    const department = await Department.create({
      name,
      parentId: parentId || null,
      sortOrder: sortOrder || 0
    });

    response.success(res, department, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新部门
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, parentId, sortOrder } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return response.error(res, '部门不存在', 404);
    }

    // 防止将自己设为父部门
    if (parentId && parseInt(parentId) === parseInt(id)) {
      return response.error(res, '不能将自己设为父部门', 400);
    }

    // 检查父部门是否存在
    if (parentId) {
      const parent = await Department.findByPk(parentId);
      if (!parent) {
        return response.error(res, '父部门不存在', 400);
      }
    }

    await department.update({
      name: name || department.name,
      parentId: parentId !== undefined ? parentId : department.parentId,
      sortOrder: sortOrder !== undefined ? sortOrder : department.sortOrder
    });

    response.success(res, department, '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除部门
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return response.error(res, '部门不存在', 404);
    }

    // 检查是否有子部门
    const childCount = await Department.count({ where: { parentId: id } });
    if (childCount > 0) {
      return response.error(res, '请先删除子部门', 400);
    }

    // 检查是否有员工
    const userCount = await User.count({ where: { departmentId: id } });
    if (userCount > 0) {
      return response.error(res, '部门下还有员工，无法删除', 400);
    }

    await department.destroy();
    response.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartmentTree,
  getDepartmentList,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
