const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const User    = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * Messaging Routes — Admin-to-Farmer Direct Contact
 * Team Antigravity | Smart Farm Management System
 *
 * Only admins can initiate a message thread.
 * Farmers can only reply to existing threads.
 */

// @GET /api/messages/inbox — Get all messages for the logged-in user
router.get('/inbox', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    let messages;

    if (req.user.role === 'admin') {
      // Admin sees all conversations grouped by farmer
      messages = await Message.find({})
        .populate('senderId', 'name email role')
        .populate('receiverId', 'name email role')
        .populate('farmerId', 'name email phone')
        .sort('-createdAt');
    } else {
      // Farmer sees only their own messages
      messages = await Message.find({ farmerId: userId })
        .populate('senderId', 'name email role')
        .populate('receiverId', 'name email role')
        .sort('-createdAt');
    }

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/messages/thread/:farmerId — Get the thread between admin and a specific farmer
router.get('/thread/:farmerId', protect, async (req, res) => {
  try {
    const { farmerId } = req.params;
    const messages = await Message.find({ farmerId })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort('createdAt'); // Chronological order for chat view

    // Mark messages as read for the current user
    await Message.updateMany(
      { farmerId, receiverId: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/messages — Send a message (Admin initiates, farmer replies)
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content, subject } = req.body;
    if (!content || !receiverId) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    // Determine farmerId: it's always the farmer in the conversation
    let farmerId;
    if (req.user.role === 'admin') {
      // Admin is sending — receiver must be a farmer
      if (receiver.role !== 'farmer') {
        return res.status(400).json({ message: 'Admin can only message farmers' });
      }
      farmerId = receiverId;
    } else {
      // Farmer is replying — sender is farmer, receiver must be admin
      if (receiver.role !== 'admin') {
        return res.status(400).json({ message: 'Farmer can only reply to admin' });
      }
      farmerId = req.user._id;
    }

    const message = await Message.create({
      senderId:   req.user._id,
      receiverId,
      farmerId,
      content,
      senderRole: req.user.role,
      subject:    subject || '',
    });

    // Also push a notification to the receiver
    await User.findByIdAndUpdate(receiverId, {
      $push: {
        notifications: {
          message: `New message from ${req.user.name}: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
          read: false,
        }
      }
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/messages/unread-count — Count unread messages for current user
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/messages/:id — Admin can delete a message
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
