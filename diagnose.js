const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Booking = require('./models/Booking');

const app = express();
app.use(express.json());

// Comprehensive MongoDB diagnostic endpoint
app.get('/api/diagnose', async (req, res) => {
  console.log('🔍 Running comprehensive MongoDB diagnosis...');

  const diagnosis = {
    timestamp: new Date(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      MONGO_URI: process.env.MONGO_URI ? 'set (length: ' + process.env.MONGO_URI.length + ')' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'set (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT SET',
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

  // Test 1: Basic connection
  try {
    if (mongoose.connection.readyState === 1) {
      diagnosis.tests.connection = '✅ Connected';
    } else {
      diagnosis.tests.connection = '❌ Not connected';
    }
  } catch (error) {
    diagnosis.tests.connection = '❌ Error: ' + error.message;
  }

  // Test 2: User collection access
  try {
    const userCount = await User.countDocuments();
    diagnosis.tests.users = `✅ Accessible (${userCount} documents)`;
  } catch (error) {
    diagnosis.tests.users = '❌ Error: ' + error.message;
  }

  // Test 3: Booking collection access
  try {
    const bookingCount = await Booking.countDocuments();
    diagnosis.tests.bookings = `✅ Accessible (${bookingCount} documents)`;
  } catch (error) {
    diagnosis.tests.bookings = '❌ Error: ' + error.message;
  }

  // Test 4: Create test user
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpass123', salt);

    const testUser = await User.create({
      name: 'Test User',
      email: testEmail,
      password: hashedPassword
    });

    diagnosis.tests.createUser = `✅ Created user: ${testUser._id}`;

    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    diagnosis.tests.cleanupUser = '✅ Test user cleaned up';

  } catch (error) {
    diagnosis.tests.createUser = '❌ Error: ' + error.message;
  }

  // Test 5: JWT token generation
  try {
    if (process.env.JWT_SECRET) {
      const token = jwt.sign({ id: 'test' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      diagnosis.tests.jwt = '✅ Token generated successfully';
    } else {
      diagnosis.tests.jwt = '❌ JWT_SECRET not set';
    }
  } catch (error) {
    diagnosis.tests.jwt = '❌ Error: ' + error.message;
  }

  // Overall status
  const allTestsPass = Object.values(diagnosis.tests).every(test =>
    test.startsWith('✅')
  );

  diagnosis.overall = {
    status: allTestsPass ? '✅ ALL SYSTEMS OPERATIONAL' : '❌ ISSUES DETECTED',
    summary: allTestsPass
      ? 'MongoDB is working correctly. Registration and booking should work.'
      : 'There are issues that need to be fixed. Check the details above.'
  };

  console.log('📋 Diagnosis complete:', diagnosis.overall.status);

  res.json(diagnosis);
});

// Quick health check
app.get('/api/health', (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  res.json({
    status: mongoConnected ? 'OK' : 'DB Down',
    mongodb: mongoConnected ? 'Connected ✅' : 'Connection Failed ❌',
    mongoUri: process.env.MONGO_URI ? 'Set' : 'NOT SET',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'NOT SET',
    timestamp: new Date(),
    help: mongoConnected ? null : 'Set MONGO_URI and JWT_SECRET in Render environment variables'
  });
});

module.exports = app;