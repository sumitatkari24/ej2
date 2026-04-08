const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { isDBAvailable } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create booking
router.post('/', protect, async (req, res) => {
  const { tripId, pickupAddress, pickupDate, travelDate, numTravelers, paymentMethod, totalPrice, basePrice, extraDays, extraDaysCharge, extraPersons, extraPersonsCharge, cardDetails } = req.body;
  try {
    // Log incoming request
    console.log('📝 Booking request received:');
    console.log('   User ID:', req.user ? req.user._id : 'NULL');
    console.log('   Trip ID:', tripId);
    console.log('   Pickup Date:', pickupDate);
    console.log('   Travel Date:', travelDate);
    console.log('   Address:', pickupAddress);
    console.log('   Total Price:', totalPrice);
    console.log('   Extra Charges - Days:', extraDays, 'Persons:', extraPersons);

    // Check if database is really available
    const dbAvailable = await isDBAvailable();
    if (!dbAvailable) {
      console.error('❌ Database not available during booking');
      return res.status(503).json({
        message: 'Database not available. Please contact support.',
        hint: 'MongoDB connection failed. Check MONGO_URI environment variable.'
      });
    }

    // Validate user
    if (!req.user || !req.user._id) {
      console.error('❌ Auth error: User not found in request');
      return res.status(401).json({ message: 'User not authenticated. Please login again.' });
    }

    if (!tripId || !pickupDate || !travelDate || !pickupAddress) {
      console.warn('❌ Validation failed - Missing fields:', { tripId, pickupDate, travelDate, pickupAddress });
      return res.status(400).json({ message: 'Trip ID, pickup date, travel date, and pickup address are required' });
    }

    // Validate Trip ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      console.error('❌ Invalid Trip ID format:', tripId);
      console.error('   This appears to be a sample trip ID. Please select a valid trip from the available list.');
      return res.status(400).json({ 
        message: 'Invalid trip ID. Please refresh the page and select a valid trip from the list.' 
      });
    }

    // Validate and parse dates
    let pickupDateObj, travelDateObj;
    try {
      pickupDateObj = new Date(pickupDate);
      travelDateObj = new Date(travelDate);
      
      if (isNaN(pickupDateObj.getTime()) || isNaN(travelDateObj.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (dateErr) {
      console.error('❌ Date parsing error:', dateErr.message);
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

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

    // Verify trip exists in database
    const Trip = require('../models/Trip');
    let tripExists;
    try {
      tripExists = await Trip.findById(tripId);
    } catch (findErr) {
      console.error('❌ Trip lookup error:', findErr.message);
      return res.status(400).json({ message: 'Invalid trip ID. Please select a valid trip.' });
    }

    if (!tripExists) {
      console.error('❌ Trip not found in database:', tripId);
      return res.status(404).json({ message: 'Trip not found. Please refresh and select a valid trip.' });
    }

    // Create booking with extra charges
    const booking = await Booking.create({
      userId: req.user._id,
      tripId,
      pickupAddress,
      pickupDate: pickupDateObj,
      travelDate: travelDateObj,
      numTravelers: parseInt(numTravelers, 10) || 1,
      paymentMethod: paymentMethod || 'cash',
      basePrice: basePrice || 0,
      extraDays: extraDays || 0,
      extraDaysCharge: extraDaysCharge || 0,
      extraPersons: extraPersons || 0,
      extraPersonsCharge: extraPersonsCharge || 0,
      totalPrice: totalPrice || 0,
      status: 'confirmed',
      paymentStatus: 'pending'
    });
    
    console.log('✅ Booking created successfully:', booking._id);
    console.log('   Extra charges stored - Days:', booking.extraDays, 'Persons:', booking.extraPersons);
    res.status(201).json(booking);
  } catch (error) {
    console.error('❌ Booking creation error:', error.message);
    console.error('   Error type:', error.name);
    console.error('   Stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid trip ID format. Please select a valid trip from the list.' });
    }
    
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