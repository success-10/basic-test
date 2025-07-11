const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'retail_summaries', // Folder name in your Cloudinary account
    allowed_formats: ['pdf', 'csv', 'xls', 'xlsx'],
  },
});

const upload = multer({ storage });

module.exports = upload;
