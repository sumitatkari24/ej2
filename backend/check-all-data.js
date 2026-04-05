const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Booking = require('./models/Booking');

async function checkAllData() {
  try {
    console.log('🔗 Connecting to database...\n');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get all users
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);
    console.log('👥 USERS (Last 10):');
    console.log('   Total count:', await User.countDocuments());
    users.forEach((u, i) => {
      console.log(`   ${i+1}. ${u.name} (${u.email}) - Created: ${u.createdAt}`);
    });
    
    // Get all bookings
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(10);
    console.log('\n📝 BOOKINGS (Last 10):');
    console.log('   Total count:', await Booking.countDocuments());
    bookings.forEach((b, i) => {
      console.log(`   ${i+1}. Booking: ${b._id}`);
      console.log(`      Trip: ${b.tripId}, Status: ${b.status}, Created: ${b.createdAt}`);
    });
    
    // Get trips count
    const Trip = require('./models/Trip');
    const trips = await Trip.find().select('title destination _id').limit(5);
    console.log('\n🏝️  TRIPS (First 5):');
    console.log('   Total count:', await Trip.countDocuments());
    trips.forEach((t, i) => {
      console.log(`   ${i+1}. ${t.title} (${t.destination}) - ID: ${t._id}`);
    });
    
    console.log('\n✅ All data fetched successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllData();
