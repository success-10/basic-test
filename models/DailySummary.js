const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  product: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DailySummary', dailySummarySchema);
