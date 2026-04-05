const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create booking
router.post('/', protect, async (req, res) => {
  const { tripId, pickupAddress, pickupDate, travelDate, numTravelers, paymentMethod, totalPrice, cardDetails } = req.body;
  try {
    if (!tripId || !pickupDate || !travelDate || !pickupAddress) {
      console.warn('Booking validation failed:', { tripId, pickupDate, travelDate, pickupAddress });
      return res.status(400).json({ message: 'Trip ID, pickup date, travel date, and pickup address are required' });
    }

    // Validate pickup date is in the future
    const pickupDateObj = new Date(pickupDate);
    const travelDateObj = new Date(travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDateObj < today) {
      return res.status(400).json({ message: 'Pickup date must be in the future' });
    }

    if (travelDateObj < today) {
      return res.status(400).json({ message: 'Travel date must be in the future' });
    }

    if (travelDateObj <= pickupDateObj) {
      return res.status(400).json({ message: 'Travel date must be after pickup date' });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      tripId,
      pickupAddress,
      pickupDate: pickupDateObj,
      travelDate: travelDateObj,
      numTravelers: numTravelers || 1,
      paymentMethod: 'cash',
      totalPrice: totalPrice || 0,
      status: 'confirmed'
    });
    console.log('✅ Booking created:', booking._id);
    res.status(201).json(booking);
  } catch (error) {
    console.error('❌ Booking creation error:', error.message);
    res.status(500).json({ message: 'Failed to create booking: ' + error.message });
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