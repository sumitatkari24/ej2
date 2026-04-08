const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  console.log('MONGO_URI:', mongoUri ? 'SET (length: ' + mongoUri.length + ')' : 'NOT SET ❌');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT SET ❌');

  if (!mongoUri) {
    console.error('❌ MONGO_URI is missing or empty');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is missing');
    process.exit(1);
  }

  try {
    console.log('\n🔗 Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ SUCCESS: MongoDB Connected!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);

    // Test basic operations
    const User = require('./backend/models/User');
    const Booking = require('./backend/models/Booking');
    const Trip = require('./backend/models/Trip');

    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const tripCount = await Trip.countDocuments();

    console.log('\n📊 Database Status:');
    console.log('   Users:', userCount);
    console.log('   Bookings:', bookingCount);
    console.log('   Trips:', tripCount);

    await mongoose.connection.close();
    console.log('\n✅ Connection test PASSED - Ready for Render deployment');

  } catch (error) {
    console.error('\n❌ FAILED: MongoDB Connection Error');
    console.error('   Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check MONGO_URI is correct');
    console.error('   2. Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0)');
    console.error('   3. Ensure database user credentials are valid');
    process.exit(1);
  }
}

testConnection();