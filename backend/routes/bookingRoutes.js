const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create booking
router.post('/', protect, async (req, res) => {
  const { tripId, travelDate } = req.body;
  try {
    if (!tripId || !travelDate) {
      return res.status(400).json({ message: 'Trip ID and travel date are required' });
    }

    // Validate travel date is in the future
    const dateObj = new Date(travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
      return res.status(400).json({ message: 'Travel date must be in the future' });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      tripId,
      travelDate: dateObj
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user bookings
router.get('/user/:id', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id }).populate('tripId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;