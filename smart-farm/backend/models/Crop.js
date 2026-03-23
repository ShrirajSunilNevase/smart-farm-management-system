const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  cropStatus: {
    type: String,
    enum: ['to_be_sown', 'sown', 'harvested'],
    default: 'to_be_sown'
  },
  sowingDate: { type: Date },
  harvestDate: { type: Date },
  fertilizer: { type: String, default: '' },
  notes: { type: String, default: '' },
  landId: { type: mongoose.Schema.Types.ObjectId, ref: 'Land' }
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);
