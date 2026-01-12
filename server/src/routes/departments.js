/**
 * 部门路由
 */

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { adminOnly } = require('../middlewares/auth');

// 获取部门树
router.get('/', departmentController.getDepartmentTree);

// 获取部门列表（平铺）
router.get('/list', departmentController.getDepartmentList);

// 创建部门（需要管理员权限）
router.post('/', adminOnly, departmentController.createDepartment);

// 更新部门（需要管理员权限）
router.put('/:id', adminOnly, departmentController.updateDepartment);

// 删除部门（需要管理员权限）
router.delete('/:id', adminOnly, departmentController.deleteDepartment);

module.exports = router;
