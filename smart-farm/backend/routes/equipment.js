const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { protect, farmerOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { farmerId: req.user._id };
    const equipment = await Equipment.find(filter).populate('farmerId', 'name email').sort('-createdAt');
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, farmerOnly, async (req, res) => {
  try {
    const item = await Equipment.create({ ...req.body, farmerId: req.user._id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, farmerOnly, async (req, res) => {
  try {
    const item = await Equipment.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user._id },
      req.body, { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, farmerOnly, async (req, res) => {
  try {
    await Equipment.findOneAndDelete({ _id: req.params.id, farmerId: req.user._id });
    res.json({ message: 'Equipment removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
