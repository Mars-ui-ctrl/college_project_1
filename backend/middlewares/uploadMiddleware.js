const multer = require('multer');
const AppError = require('../utils/AppError');

// Memory storage keeps buffers in RAM for quick cloud streaming
const storage = multer.memoryStorage();

// Mime validation filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdf') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Invalid format. Only PDF documents are allowed.', 400), false);
    }
  } else if (file.fieldname === 'avatar') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid format. Only image files (PNG, JPG, JPEG) are allowed.', 400), false);
    }
  } else {
    cb(new AppError('Unexpected field identifier for file upload.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Maximum size: 15MB for raw PDFs
  },
});

module.exports = upload;
