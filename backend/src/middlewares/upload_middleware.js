const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'backend/src/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'capa' && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }

  if (file.fieldname === 'arquivo' && (file.mimetype === 'application/json' || file.originalname.endsWith('.json'))) {
    return cb(null, true);
  }

  return cb(new Error('Arquivo invalido para este campo.'));
};

module.exports = multer({ storage, fileFilter });
