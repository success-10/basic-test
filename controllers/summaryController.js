const DailySummary = require('../models/DailySummary');

exports.uploadSummary = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded'));
    }

    const { product } = req.body;

    if (!product) {
      res.status(400);
      return next(new Error('Product field is required'));
    }

    const fileUrl = req.file.path; // Cloudinary returns 'path' as the URL

    const summary = await DailySummary.create({
      product,
      fileUrl,
      uploadedBy: req.user._id,
    });

    res.status(201).json(summary);
  } catch (error) {
    next(error);
  }
};
