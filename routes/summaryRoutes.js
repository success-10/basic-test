const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadSummary } = require('../controllers/summaryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('file'), uploadSummary);

module.exports = router;
