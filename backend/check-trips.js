const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Trip = require('./models/Trip');

async function checkTrips() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const count = await Trip.countDocuments();
    console.log('✅ Trips in database:', count);
    
    if (count === 0) {
      console.log('⚠️  No trips found! Need to seed the database.');
    } else {
      const trips = await Trip.find().limit(3);
      console.log('\n📝 Sample trips:');
      trips.forEach((t, i) => {
        console.log(`  ${i+1}. ${t.title}`);
        console.log(`     Destination: ${t.destination}`);
        console.log(`     ID: ${t._id}`);
      });
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTrips();
