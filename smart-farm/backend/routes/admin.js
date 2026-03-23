const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Land = require('../models/Land');
const Crop = require('../models/Crop');
const Equipment = require('../models/Equipment');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalLands = await Land.countDocuments();
    const pendingLands = await Land.countDocuments({ approvalStatus: 'pending' });
    const approvedLands = await Land.countDocuments({ approvalStatus: 'approved' });
    const totalCrops = await Crop.countDocuments();
    const activeCrops = await Crop.countDocuments({ cropStatus: 'sown' });
    const totalEquipment = await Equipment.countDocuments();

    const cropStatusStats = await Crop.aggregate([
      { $group: { _id: '$cropStatus', count: { $sum: 1 } } }
    ]);

    const landStatusStats = await Land.aggregate([
      { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      totalFarmers, totalLands, pendingLands, approvedLands,
      totalCrops, activeCrops, totalEquipment,
      cropStatusStats, landStatusStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/admin/farmers
router.get('/farmers', protect, adminOnly, async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password').sort('-createdAt');
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/admin/farmers/:id/details
router.get('/farmers/:id/details', protect, adminOnly, async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id).select('-password');
    const lands = await Land.find({ farmerId: req.params.id });
    const crops = await Crop.find({ farmerId: req.params.id });
    const equipment = await Equipment.find({ farmerId: req.params.id });
    res.json({ farmer, lands, crops, equipment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/admin/seed - Create default admin
router.post('/seed', async (req, res) => {
  try {
    const existing = await User.findOne({ email: 'admin@smartfarm.com' });
    if (existing) return res.json({ message: 'Admin already exists' });

    await User.create({
      name: 'Land Officer',
      email: 'admin@smartfarm.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
      address: 'Agriculture Department HQ'
    });
    res.json({ message: 'Admin created: admin@smartfarm.com / admin123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
