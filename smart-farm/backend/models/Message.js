const mongoose = require('mongoose');

/**
 * Message Model — Admin-to-Farmer Direct Messaging
 * Team Antigravity | Smart Farm Management System
 *
 * Only admins can initiate conversations. Farmers can reply.
 * Both admin and the relevant farmer can see the message thread.
 */
const messageSchema = new mongoose.Schema({
  // The conversation thread is identified by (adminId + farmerId)
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Which farmer this conversation belongs to (for easy querying)
  farmerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:    { type: String, required: true, trim: true },
  senderRole: { type: String, enum: ['admin', 'farmer'], required: true },
  read:       { type: Boolean, default: false },
  subject:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
