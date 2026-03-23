const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landSize: { type: Number, required: true },
  unit: { type: String, enum: ['acres', 'hectares'], default: 'acres' },
  soilType: { type: String, required: true },
  irrigationType: { type: String, required: true },
  location: { type: String, required: true },
  surveyNumber: { type: String, required: true },
  document: { type: String, default: '' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  remarks: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Land', landSchema);
