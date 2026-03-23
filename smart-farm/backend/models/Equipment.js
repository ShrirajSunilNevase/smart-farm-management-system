const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipmentName: { type: String, required: true },
  type: { type: String, required: true },
  purchaseYear: { type: Number, required: true },
  condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], default: 'good' }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
