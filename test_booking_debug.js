const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'trip-management-system', 'backend', '.env') });

const User = require('./trip-management-system/backend/models/User');
const Trip = require('./trip-management-system/backend/models/Trip');
const Booking = require('./trip-management-system/backend/models/Booking');

async function testBooking() {
  try {
    console.log('🔗 Connecting to database...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'NOT SET');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    // Get first user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database. Please register first.');
      mongoose.connection.close();
      return;
    }
    console.log('✅ Found user:', user.email);

    // Get first trip
    const trip = await Trip.findOne();
    if (!trip) {
      console.log('❌ No trips found in database.');
      mongoose.connection.close();
      return;
    }
    console.log('✅ Found trip:', trip.title);

    // Try to create a booking
    console.log('\n📝 Attempting to create booking...');
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1); // Tomorrow

    const travelDate = new Date();
    travelDate.setDate(travelDate.getDate() + 3); // 3 days from now

    console.log('Booking details:', {
      userId: user._id,
      tripId: trip._id,
      pickupDate: pickupDate.toISOString().split('T')[0],
      travelDate: travelDate.toISOString().split('T')[0],
      pickupAddress: '123 Main Street, New York, NY',
      totalPrice: trip.price
    });

    const booking = await Booking.create({
      userId: user._id,
      tripId: trip._id,
      pickupDate,
      travelDate,
      pickupAddress: '123 Main Street, New York, NY',
      numTravelers: 1,
      paymentMethod: 'cash',
      totalPrice: trip.price,
      status: 'confirmed'
    });

    console.log('\n✅ Booking created successfully!');
    console.log('Booking ID:', booking._id);
    console.log('Status:', booking.status);
    console.log('Payment Status:', booking.paymentStatus);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from database');
  }
}

testBooking();
