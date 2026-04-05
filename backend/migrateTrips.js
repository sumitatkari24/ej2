const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trip = require('./models/Trip');

dotenv.config();

async function migrateTrips() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    const trips = await Trip.find();
    
    for (const trip of trips) {
      let updated = false;
      
      if (!trip.standardTravelers) {
        trip.standardTravelers = 2;
        updated = true;
      }
      if (!trip.pricePerDay) {
        trip.pricePerDay = 50;
        updated = true;
      }
      if (!trip.pricePerPerson) {
        trip.pricePerPerson = 100;
        updated = true;
      }
      
      if (updated) {
        await trip.save();
      }
    }

    console.log(`✅ Updated ${trips.length} trips with pricing configuration`);
    
    // Verify
    const verifyTrips = await Trip.find().limit(1);
    if (verifyTrips.length > 0) {
      const sample = verifyTrips[0];
      console.log('\n📋 Sample Trip After Migration:');
      console.log(`   Title: ${sample.title}`);
      console.log(`   Price: $${sample.price}`);
      console.log(`   Standard Travelers: ${sample.standardTravelers}`);
      console.log(`   Price per Day: $${sample.pricePerDay}`);
      console.log(`   Price per Person: $${sample.pricePerPerson}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateTrips();
