const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./backend/models/Booking');

dotenv.config({ path: './backend/.env' });

async function testBookingCreation() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Get a user and trip from the database
    const User = require('./backend/models/User');
    const Trip = require('./backend/models/Trip');

    const users = await User.find().limit(1);
    if (users.length === 0) {
      console.error('No users found in database');
      process.exit(1);
    }

    const trips = await Trip.find().limit(1);
    if (trips.length === 0) {
      console.error('No trips found in database');
      process.exit(1);
    }

    const userId = users[0]._id;
    const tripId = trips[0]._id;

    console.log(`\n📝 Creating booking with extra charges...`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Trip ID: ${tripId}`);

    // Create booking with extra charges
    const bookingData = {
      userId: userId,
      tripId: tripId,
      pickupDate: new Date('2026-04-15'),
      travelDate: new Date('2026-04-20'),
      pickupAddress: '789 Direct Test Street',
      numTravelers: 4,
      basePrice: 1500,
      extraDays: 3,
      extraDaysCharge: 150,
      extraPersons: 2,
      extraPersonsCharge: 200,
      totalPrice: 1850,
      status: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: 'cash'
    };

    console.log(`\n📊 Booking data:`);
    console.log(JSON.stringify(bookingData, null, 2));

    const booking = await Booking.create(bookingData);

    console.log(`\n✅ Booking created successfully!`);
    console.log(`\n📋 Created Booking:`);
    console.log(JSON.stringify(booking, null, 2));

    // Verify by querying back
    const retrievedBooking = await Booking.findById(booking._id);
    console.log(`\n✅ Retrieved Booking (verification):`);
    console.log(JSON.stringify(retrievedBooking, null, 2));

    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testBookingCreation();
