const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');

const router = express.Router();

// Create payment for a booking
// Supports: card, upi, paypal
router.post('/process-payment', protect, async (req, res) => {
  const { bookingId, amount, paymentMethod, cardDetails } = req.body;

  try {
    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'Booking ID and amount are required' });
    }

    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // In production, integrate with payment providers:
    // - Card: Stripe, RazorPay
    // - UPI: Razorpay, PayU, or local UPI gateway
    // - PayPal: PayPal API
    // For now, simulate successful payment for all methods
    
    booking.paid = true;
    booking.paymentMethod = paymentMethod || 'card';
    booking.paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    booking.paymentDate = new Date();
    booking.amount = amount;
    await booking.save();

    res.json({
      success: true,
      message: `Payment processed successfully via ${paymentMethod || 'card'}`,
      bookingId: booking._id,
      paymentId: booking.paymentId,
      amount: amount,
      paymentMethod: paymentMethod,
      status: 'completed'
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Payment processing failed: ' + error.message });
  }
});

// Get payment status
router.get('/status/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      bookingId: booking._id,
      paid: booking.paid || false,
      paymentId: booking.paymentId,
      paymentMethod: booking.paymentMethod,
      paymentDate: booking.paymentDate,
      amount: booking.amount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
