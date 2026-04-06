const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function testMongoConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  const mongoUri = process.env.MONGO_URI;
  const jwtSecret = process.env.JWT_SECRET;

  console.log('📋 Environment Variables:');
  console.log('   MONGO_URI:', mongoUri ? '✅ Set' : '❌ NOT SET');
  console.log('   JWT_SECRET:', jwtSecret ? '✅ Set' : '❌ NOT SET');
  console.log('');

  if (!mongoUri) {
    console.error('❌ MONGO_URI is not set in environment variables!');
    console.log('💡 Fix: Add MONGO_URI to your .env file or Render environment variables');
    return false;
  }

  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    console.log('   Ready State:', conn.connection.readyState);

    // Test basic operations
    console.log('\n🧪 Testing Database Operations...');

    // Check if we can list collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('✅ Can list collections:', collections.length, 'found');

    // Test User model
    const User = require('./backend/models/User');
    const userCount = await User.countDocuments();
    console.log('✅ Users collection accessible, count:', userCount);

    // Test Booking model
    const Booking = require('./backend/models/Booking');
    const bookingCount = await Booking.countDocuments();
    console.log('✅ Bookings collection accessible, count:', bookingCount);

    console.log('\n🎉 ALL TESTS PASSED - MongoDB is working correctly!');
    console.log('💡 Your local setup is ready. Now configure Render environment variables.');

    await mongoose.disconnect();
    return true;

  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('   Error:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Possible fixes:');
      console.log('   1. Check username/password in MONGO_URI');
      console.log('   2. Verify database user permissions in MongoDB Atlas');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Possible fixes:');
      console.log('   1. Check MONGO_URI format and cluster URL');
      console.log('   2. Verify cluster is running in MongoDB Atlas');
    } else if (error.message.includes('connection timed out')) {
      console.log('\n💡 Possible fixes:');
      console.log('   1. Check IP whitelist in MongoDB Atlas');
      console.log('   2. Allow 0.0.0.0/0 for testing');
    }

    return false;
  }
}

// Run the test
testMongoConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('💥 Test script error:', err);
  process.exit(1);
});