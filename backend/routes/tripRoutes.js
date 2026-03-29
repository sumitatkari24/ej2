const express = require('express');
const Trip = require('../models/Trip');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({});
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create trip (admin only)
router.post('/', protect, admin, async (req, res) => {
  const { title, destination, price, duration, description, imageUrl } = req.body;
  try {
    const trip = await Trip.create({
      title,
      destination,
      price,
      duration,
      description,
      imageUrl
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update trip (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete trip (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;