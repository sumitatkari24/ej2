const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./backend/models/User');
const Booking = require('./backend/models/Booking');
const Trip = require('./backend/models/Trip');
const { connectDB, isDBAvailable } = require('./backend/config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const app = express();
app.use(express.json());

// Comprehensive diagnostic endpoint
app.get('/api/diagnose-full', async (req, res) => {
  console.log('🔍 Running comprehensive MongoDB diagnosis...');

  const diagnosis = {
    timestamp: new Date(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      MONGO_URI: process.env.MONGO_URI ? 'set (length: ' + process.env.MONGO_URI.length + ')' : 'NOT SET ❌',
      JWT_SECRET: process.env.JWT_SECRET ? 'set (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT SET ❌',
      PORT: process.env.PORT || 'not set'
    },
    mongodb: {
      mongooseReadyState: mongoose.connection.readyState,
      mongooseConnected: mongoose.connection.readyState === 1,
      connectionHost: mongoose.connection.host || 'not connected',
      connectionName: mongoose.connection.name || 'not connected'
    },
    tests: {}
  };

  // Test database availability
  try {
    diagnosis.tests.dbAvailable = await isDBAvailable();
  } catch (error) {
    diagnosis.tests.dbAvailable = '❌ Error: ' + error.message;
  }

  // Test user operations
  try {
    const userCount = await User.countDocuments();
    diagnosis.tests.users = `✅ Accessible (${userCount} users)`;

    // Test user creation
    const testUser = new User({
      name: 'Diagnostic Test User',
      email: 'diag' + Date.now() + '@test.com',
      password: 'testpass'
    });
    await testUser.save();
    diagnosis.tests.userCreate = '✅ User creation successful';

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    diagnosis.tests.userCleanup = '✅ User cleanup successful';

  } catch (error) {
    diagnosis.tests.users = '❌ Error: ' + error.message;
    diagnosis.tests.userCreate = '❌ Error: ' + error.message;
  }

  // Test booking operations
  try {
    const bookingCount = await Booking.countDocuments();
    diagnosis.tests.bookings = `✅ Accessible (${bookingCount} bookings)`;
  } catch (error) {
    diagnosis.tests.bookings = '❌ Error: ' + error.message;
  }

  // Test trip operations
  try {
    const tripCount = await Trip.countDocuments();
    diagnosis.tests.trips = `✅ Accessible (${tripCount} trips)`;
  } catch (error) {
    diagnosis.tests.trips = '❌ Error: ' + error.message;
  }

  // JWT test
  diagnosis.tests.jwt = process.env.JWT_SECRET ? '✅ JWT_SECRET available' : '❌ JWT_SECRET not set';

  // Overall status
  const criticalIssues = [
    diagnosis.environment.MONGO_URI.includes('NOT SET'),
    diagnosis.environment.JWT_SECRET.includes('NOT SET'),
    diagnosis.tests.dbAvailable === false,
    diagnosis.tests.users.includes('❌'),
    diagnosis.tests.bookings.includes('❌'),
    diagnosis.tests.trips.includes('❌'),
    diagnosis.tests.jwt.includes('❌')
  ].filter(Boolean).length;

  diagnosis.overall = {
    status: criticalIssues === 0 ? '✅ ALL SYSTEMS OPERATIONAL' : `❌ ${criticalIssues} ISSUES DETECTED`,
    action_required: criticalIssues > 0 ? 'Check environment variables and MongoDB connection' : null,
    recommendation: criticalIssues > 0 ?
      '1. Verify MONGO_URI and JWT_SECRET in Render environment\n2. Check MongoDB Atlas IP whitelist\n3. Ensure database user has correct permissions' :
      'Data persistence should work correctly'
  };

  console.log('📋 Diagnosis:', diagnosis.overall.status);
  res.json(diagnosis);
});

// Start diagnostic server
async function startDiagnostic() {
  const mongoConnected = await connectDB();

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🔍 Diagnostic server running on port ${PORT}`);
    console.log(`📍 Visit: http://localhost:${PORT}/api/diagnose-full`);
    console.log(`MongoDB connected at startup: ${mongoConnected}`);
  });
}

startDiagnostic();