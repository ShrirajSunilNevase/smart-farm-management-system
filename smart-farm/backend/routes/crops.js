const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const { protect, farmerOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { farmerId: req.user._id };
    const crops = await Crop.find(filter).populate('farmerId', 'name email').sort('-createdAt');
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, farmerOnly, async (req, res) => {
  try {
    const crop = await Crop.create({ ...req.body, farmerId: req.user._id });
    res.status(201).json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, farmerOnly, async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user._id },
      req.body, { new: true }
    );
    if (!crop) return res.status(404).json({ message: 'Not found' });
    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, farmerOnly, async (req, res) => {
  try {
    await Crop.findOneAndDelete({ _id: req.params.id, farmerId: req.user._id });
    res.json({ message: 'Crop removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
