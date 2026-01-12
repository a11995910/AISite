/**
 * 用户路由
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { adminOnly } = require('../middlewares/auth');

// 获取用户列表（需要管理员权限）
router.get('/', adminOnly, userController.getUsers);

// 获取单个用户
router.get('/:id', userController.getUser);

// 创建用户（需要管理员权限）
router.post('/', adminOnly, userController.createUser);

// 更新用户（需要管理员权限）
router.put('/:id', adminOnly, userController.updateUser);

// 删除用户（需要管理员权限）
router.delete('/:id', adminOnly, userController.deleteUser);

// 重置密码（需要管理员权限）
router.put('/:id/reset-password', adminOnly, userController.resetPassword);

module.exports = router;
