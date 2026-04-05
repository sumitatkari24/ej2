const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Booking = require('./models/Booking');

async function testDatabasePersistence() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('   MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check connection state
    const readyState = mongoose.connection.readyState;
    console.log('   Connection state:', readyState === 1 ? 'CONNECTED ✅' : 'FAILED ❌');
    
    // Count existing documents
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    console.log('\n📊 Current database state:');
    console.log('   Users:', userCount);
    console.log('   Bookings:', bookingCount);
    
    // Test: Create a test user
    console.log('\n📝 Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const testUser = await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'hashedPasswordWouldBeHere'
    });
    
    console.log('✅ User created:', testUser._id);
    
    // Verify it was saved
    const foundUser = await User.findById(testUser._id);
    if (foundUser) {
      console.log('✅ User verified in database');
      console.log('   Email:', foundUser.email);
    } else {
      console.log('❌ User NOT found in database!');
    }
    
    // Clean up - delete test user
    await User.deleteOne({ _id: testUser._id });
    console.log('🗑️  Test user deleted');
    
    // Final count
    const finalUserCount = await User.countDocuments();
    console.log('\n📊 Final state:');
    console.log('   Users:', finalUserCount);
    
    console.log('\n✅ Database persistence test completed successfully!');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDatabasePersistence();
