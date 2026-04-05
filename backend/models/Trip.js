const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  standardTravelers: {
    type: Number,
    default: 2,
    description: 'Number of travelers included in base price'
  },
  pricePerDay: {
    type: Number,
    default: 50,
    description: 'Extra charge per additional day beyond trip duration'
  },
  pricePerPerson: {
    type: Number,
    default: 100,
    description: 'Extra charge per additional traveler beyond standard travelers'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);