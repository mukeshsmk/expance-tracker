const multer = require('multer');
const path = require('path');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only JPEG, PNG, WEBP images or PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
});

// Unique, collision-free name for the uploaded buffer when it's handed to blob storage
function billFileName(originalname) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(originalname);
  return `bills/bill-${uniqueSuffix}${ext}`;
}

module.exports = upload;
module.exports.billFileName = billFileName;
