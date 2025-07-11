const mongoose = require('mongoose');

const retailSchema = new mongoose.Schema({
  fillingStation: { type: String, required: true },
  lga: { type: String, required: true },
  state: { type: String, required: true },
  product: { type: String, required: true },
  retailPrice: { type: Number, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

module.exports = mongoose.model('Retail', retailSchema);
