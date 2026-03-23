const express = require('express');
const router = express.Router();
const Land = require('../models/Land');
const { protect, farmerOnly, adminOnly } = require('../middleware/auth');

// @GET /api/land - Farmer: own lands
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { farmerId: req.user._id };
    const lands = await Land.find(filter).populate('farmerId', 'name email phone').sort('-createdAt');
    res.json(lands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/land
router.post('/', protect, farmerOnly, async (req, res) => {
  try {
    const land = await Land.create({ ...req.body, farmerId: req.user._id });
    res.status(201).json(land);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/land/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land not found' });

    if (req.user.role === 'farmer' && land.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Land.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/land/:id/verify - Admin only
router.put('/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const { approvalStatus, remarks } = req.body;
    const land = await Land.findByIdAndUpdate(
      req.params.id,
      { approvalStatus, remarks, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('farmerId', 'name email');

    // Add notification to farmer
    const User = require('../models/User');
    await User.findByIdAndUpdate(land.farmerId._id, {
      $push: {
        notifications: {
          message: `Your land at ${land.location} has been ${approvalStatus}. ${remarks ? 'Remarks: ' + remarks : ''}`,
          read: false
        }
      }
    });

    res.json(land);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/land/:id
router.delete('/:id', protect, farmerOnly, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land not found' });
    if (land.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await land.deleteOne();
    res.json({ message: 'Land removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
