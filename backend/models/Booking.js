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
  pickupDate: {
    type: Date,
    required: true
  },
  travelDate: {
    type: Date,
    required: true
  },
  pickupAddress: {
    type: String,
    required: true
  },
  numTravelers: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['booked', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'paid'
  },
  paid: {
    type: Boolean,
    default: true
  },
  paymentId: String,
  paymentMethod: {
    type: String,
    enum: ['cash'],
    default: 'cash'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  totalPrice: {
    type: Number,
    required: true
  },
  basePrice: {
    type: Number,
    description: 'Trip base price'
  },
  extraDays: {
    type: Number,
    default: 0,
    description: 'Number of additional days beyond trip duration'
  },
  extraDaysCharge: {
    type: Number,
    default: 0,
    description: 'Additional charge for extra days'
  },
  extraPersons: {
    type: Number,
    default: 0,
    description: 'Number of additional travelers beyond standard'
  },
  extraPersonsCharge: {
    type: Number,
    default: 0,
    description: 'Additional charge for extra persons'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);