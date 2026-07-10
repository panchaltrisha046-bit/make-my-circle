// File Name: upload.js
const multer = require('multer');
const path = require('path');

// Configure storage location and filename rules
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    // Generates a unique name: timestamp-originalfilename
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Filter to accept only image formats
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;