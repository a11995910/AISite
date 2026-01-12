/**
 * 认证路由
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 登录
router.post('/login', authController.login);

// 注册
router.post('/register', authController.register);

// 获取部门列表（公开接口）
router.get('/departments', authController.getDepartments);

// 登出
router.post('/logout', authController.logout);

// 获取当前用户信息（需要认证）
router.get('/profile', authController.getProfile);

// 修改密码（需要认证）
router.put('/password', authController.changePassword);

module.exports = router;
