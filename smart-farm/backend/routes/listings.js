const express = require('express');
const router  = express.Router();
const Listing = require('../models/Listing');
const { protect, farmerOnly, adminOnly } = require('../middleware/auth');

/**
 * Listings Routes — KisanBazaar Marketplace
 * Team Antigravity | Smart Farm Management System
 *
 * Farmers list produce → Admin approves → Visible to all.
 */

// @GET /api/listings — Public: approved listings; Admin: all; Farmer: own
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'farmer') {
      // Farmer sees their own (all statuses) + all approved from others
      filter = { $or: [{ farmerId: req.user._id }, { approvalStatus: 'approved', isAvailable: true }] };
    } else if (req.user.role === 'admin') {
      filter = {}; // Admin sees all
    }
    const listings = await Listing.find(filter)
      .populate('farmerId', 'name phone address')
      .sort('-createdAt');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/listings/my — Farmer: own listings only
router.get('/my', protect, farmerOnly, async (req, res) => {
  try {
    const listings = await Listing.find({ farmerId: req.user._id }).sort('-createdAt');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/listings — Farmer creates a listing
router.post('/', protect, farmerOnly, async (req, res) => {
  try {
    const listing = await Listing.create({ ...req.body, farmerId: req.user._id });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/listings/:id — Farmer updates their own listing
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (req.user.role === 'farmer' && listing.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/listings/:id/approve — Admin approves/rejects a listing
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { approvalStatus, adminRemarks } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { approvalStatus, adminRemarks: adminRemarks || '' },
      { new: true }
    ).populate('farmerId', 'name email');

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Notify the farmer
    const User = require('../models/User');
    await User.findByIdAndUpdate(listing.farmerId._id, {
      $push: {
        notifications: {
          message: `Your listing for ${listing.cropName} has been ${approvalStatus}. ${adminRemarks ? 'Remarks: ' + adminRemarks : ''}`,
          read: false,
        }
      }
    });

    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/listings/:id/interest — Anyone (even unauthenticated) can express interest
router.post('/:id/interest', protect, async (req, res) => {
  try {
    const { buyerName, buyerPhone, message } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $push: { interests: { buyerName, buyerPhone, message } } },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Interest expressed successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/listings/:id — Farmer or admin can delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (req.user.role === 'farmer' && listing.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
