const mongoose = require('mongoose');

/**
 * Listing Model — KisanBazaar E-Commerce Marketplace
 * Team Antigravity | Smart Farm Management System
 *
 * Farmers list their produce for sale. Admins approve/reject.
 * Buyers can express interest via the UI.
 */
const listingSchema = new mongoose.Schema({
  farmerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName:      { type: String, required: true, trim: true },
  quantity:      { type: Number, required: true, min: 0 },
  quantityUnit:  { type: String, default: 'kg', enum: ['kg', 'quintal', 'ton', 'dozen', 'piece'] },
  pricePerUnit:  { type: Number, required: true, min: 0 },
  location:      { type: String, required: true },
  description:   { type: String, default: '' },
  imageUrl:      { type: String, default: '' },
  // Admin moderation: pending → approved/rejected before going live
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminRemarks:   { type: String, default: '' },
  // Availability
  isAvailable:   { type: Boolean, default: true },
  // Buyers who expressed interest (their contact info/name)
  interests:     [{ buyerName: String, buyerPhone: String, message: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
