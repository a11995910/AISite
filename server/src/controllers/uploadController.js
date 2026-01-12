/**
 * 文件上传控制器
 * 处理文件上传和文档解析
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const response = require('../utils/response');

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    // 确保目录存在
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/json'
  ];

  const allowedExts = ['.txt', '.md', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 创建multer实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * 解析文档内容
 * @param {string} filePath 文件路径
 * @param {string} originalName 原始文件名
 * @returns {Promise<string>} 文档文本内容
 */
const parseDocument = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  try {
    switch (ext) {
      case '.txt':
      case '.md':
      case '.json':
      case '.csv':
        // 纯文本文件直接读取
        return await fs.readFile(filePath, 'utf-8');

      case '.pdf':
        // PDF解析
        const pdfParse = require('pdf-parse');
        const pdfBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;

      case '.doc':
      case '.docx':
        // Word文档解析
        const mammoth = require('mammoth');
        const docResult = await mammoth.extractRawText({ path: filePath });
        return docResult.value;

      case '.xls':
      case '.xlsx':
        // Excel解析
        const XLSX = require('xlsx');
        const workbook = XLSX.readFile(filePath);
        let excelText = '';
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          excelText += `【工作表: ${sheetName}】\n`;
          excelText += XLSX.utils.sheet_to_csv(sheet);
          excelText += '\n\n';
        });
        return excelText;

      default:
        return `[无法解析的文件类型: ${ext}]`;
    }
  } catch (error) {
    console.error('文档解析失败:', error);
    return `[文档解析失败: ${error.message}]`;
  }
};

/**
 * 上传单个文件
 * POST /api/upload
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return response.error(res, '请选择要上传的文件', 400);
    }

    const file = req.file;
    const filePath = file.path;
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // 解析文档内容
    const content = await parseDocument(filePath, originalName);

    // 返回文件信息和解析的内容
    const result = {
      id: path.basename(file.filename, path.extname(file.filename)),
      filename: file.filename,
      originalName: originalName,
      size: file.size,
      mimeType: file.mimetype,
      content: content.slice(0, 50000), // 限制内容长度，防止过大
      contentLength: content.length,
      path: `/uploads/documents/${file.filename}`
    };

    response.success(res, result, '上传成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 上传多个文件
 * POST /api/upload/multiple
 */
const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return response.error(res, '请选择要上传的文件', 400);
    }

    const results = [];

    for (const file of req.files) {
      const filePath = file.path;
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

      // 解析文档内容
      const content = await parseDocument(filePath, originalName);

      results.push({
        id: path.basename(file.filename, path.extname(file.filename)),
        filename: file.filename,
        originalName: originalName,
        size: file.size,
        mimeType: file.mimetype,
        content: content.slice(0, 30000), // 多文件时每个文件限制更小
        contentLength: content.length,
        path: `/uploads/documents/${file.filename}`
      });
    }

    response.success(res, results, '上传成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除文件
 * DELETE /api/upload/:filename
 */
const deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/documents', filename);

    try {
      await fs.unlink(filePath);
      response.success(res, null, '删除成功');
    } catch (err) {
      if (err.code === 'ENOENT') {
        return response.error(res, '文件不存在', 404);
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadFile,
  uploadMultiple,
  deleteFile,
  parseDocument
};
