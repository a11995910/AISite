/**
 * 文件上传路由
 */

const express = require('express');
const router = express.Router();
const { upload, uploadFile, uploadMultiple, deleteFile } = require('../controllers/uploadController');

// 单文件上传
router.post('/', upload.single('file'), uploadFile);

// 多文件上传（最多5个）
router.post('/multiple', upload.array('files', 5), uploadMultiple);

// 删除文件
router.delete('/:filename', deleteFile);

module.exports = router;
