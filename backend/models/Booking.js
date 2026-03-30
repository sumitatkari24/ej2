const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paid: {
    type: Boolean,
    default: false
  },
  paymentId: String,
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'paypal', 'other'],
    default: 'card'
  },
  paymentDate: Date,
  amount: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);