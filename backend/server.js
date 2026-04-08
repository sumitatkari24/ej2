const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes').router;
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const Trip = require('./models/Trip');
const User = require('./models/User');
const Booking = require('./models/Booking');

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

if (!process.env.MONGO_URI || !process.env.MONGO_URI.trim()) {
  console.error('❌ Missing MongoDB connection string. Set MONGO_URI in Render or backend/.env.');
  process.exit(1);
}

if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
  console.error('❌ Missing JWT secret. Set JWT_SECRET in Render or backend/.env.');
  process.exit(1);
}

let mongoConnected = false;

// Sample trips for seeding
const sampleTrips = [
  {
    title: 'Paris City Escape',
    destination: 'France',
    price: 1500,
    duration: '5 days',
    description: 'Experience the magic of Paris with guided tours of the Eiffel Tower, Louvre Museum, and charming streets.',
    imageUrl: 'https://picsum.photos/600/400?random=1'
  },
  {
    title: 'Tokyo Adventure',
    destination: 'Japan',
    price: 2000,
    duration: '7 days',
    description: 'Discover ancient temples, modern technology, and vibrant culture in Tokyo. Includes Mt. Fuji day trip.',
    imageUrl: 'https://picsum.photos/600/400?random=2'
  },
  {
    title: 'New York Explorer',
    destination: 'USA',
    price: 1800,
    duration: '6 days',
    description: 'Explore Times Square, Central Park, Statue of Liberty, and enjoy world-class dining and Broadway shows.',
    imageUrl: 'https://picsum.photos/600/400?random=3'
  },
  {
    title: 'Rome Historical Tour',
    destination: 'Italy',
    price: 1600,
    duration: '5 days',
    description: 'Walk through history visiting the Colosseum, Vatican, Roman Forum, and enjoy authentic Italian cuisine.',
    imageUrl: 'https://picsum.photos/600/400?random=4'
  },
  {
    title: 'Barcelona Beach & Culture',
    destination: 'Spain',
    price: 1400,
    duration: '5 days',
    description: 'Enjoy beautiful beaches, Sagrada Familia, Park Güell, and vibrant nightlife in Barcelona.',
    imageUrl: 'https://picsum.photos/600/400?random=5'
  },
  {
    title: 'London Royal Experience',
    destination: 'United Kingdom',
    price: 1700,
    duration: '5 days',
    description: 'Visit Buckingham Palace, Tower Bridge, Big Ben, and explore royal history and museums.',
    imageUrl: 'https://picsum.photos/600/400?random=6'
  },
  {
    title: 'Dubai Luxury Getaway',
    destination: 'United Arab Emirates',
    price: 2200,
    duration: '6 days',
    description: 'Experience luxury, desert safari, Burj Khalifa, and world-class shopping in Dubai.',
    imageUrl: 'https://picsum.photos/600/400?random=7'
  },
  {
    title: 'Singapore Modern Marvel',
    destination: 'Singapore',
    price: 1900,
    duration: '4 days',
    description: 'Explore Marina Bay Sands, Gardens by the Bay, and diverse cultural neighborhoods.',
    imageUrl: 'https://picsum.photos/600/400?random=8'
  },
  {
    title: 'Bangkok Thai Experience',
    destination: 'Thailand',
    price: 1200,
    duration: '5 days',
    description: 'Discover ancient temples, floating markets, street food, and the vibrant energy of Bangkok.',
    imageUrl: 'https://picsum.photos/600/400?random=9'
  },
  {
    title: 'Sydney Harbor Escape',
    destination: 'Australia',
    price: 2100,
    duration: '6 days',
    description: 'Visit iconic Sydney Opera House and Harbour Bridge, plus beautiful beaches and wildlife.',
    imageUrl: 'https://picsum.photos/600/400?random=10'
  }
];

// Seed database with sample trips if empty
async function seedDatabase() {
  try {
    const tripCount = await Trip.countDocuments();
    if (tripCount === 0) {
      console.log('📝 Database is empty. Seeding sample trips...');
      await Trip.insertMany(sampleTrips);
      console.log(`✅ Successfully added ${sampleTrips.length} sample trips!`);
    } else {
      console.log(`ℹ️  Database already has ${tripCount} trips.`);
    }
  } catch (error) {
    console.error('⚠️  Error seeding database:', error.message);
  }
}

// Initialize server
async function startServer() {
  // Try to connect to MongoDB and stop startup if it fails
  mongoConnected = await connectDB();

  if (!mongoConnected) {
    console.error('❌ Unable to start server because MongoDB connection failed.');
    process.exit(1);
  }

  // Seed database only after successful connection
  await seedDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json());

  // API Routes (MUST come before static files)
  app.use('/api/auth', authRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: mongoConnected ? 'OK' : 'Frontend OK, DB Down',
      mongodb: mongoConnected ? 'Connected ✅' : 'Connection Failed ❌',
      mongoUri: process.env.MONGO_URI ? 'Set' : 'NOT SET',
      timestamp: new Date(),
      help: mongoConnected ? null : 'Check MONGO_URI and IP whitelist on MongoDB Atlas'
    });
  });

  // Comprehensive diagnostic endpoint
  app.get('/api/diagnose', async (req, res) => {
    console.log('🔍 Running MongoDB diagnosis...');

    const diagnosis = {
      timestamp: new Date(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        MONGO_URI: process.env.MONGO_URI ? 'set (length: ' + process.env.MONGO_URI.length + ')' : 'NOT SET ❌',
        JWT_SECRET: process.env.JWT_SECRET ? 'set (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT SET ❌',
        PORT: process.env.PORT || 'not set'
      },
      mongodb: {
        readyState: mongoose.connection.readyState,
        connected: mongoose.connection.readyState === 1,
        host: mongoose.connection.host || 'not connected',
        database: mongoose.connection.name || 'not connected'
      },
      tests: {}
    };

    // Quick connection test
    diagnosis.tests.connection = mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Not connected';

    // Quick user count test
    try {
      const userCount = await User.countDocuments();
      diagnosis.tests.users = `✅ Accessible (${userCount} users)`;
    } catch (error) {
      diagnosis.tests.users = '❌ Error: ' + error.message;
    }

    // Quick booking count test
    try {
      const bookingCount = await Booking.countDocuments();
      diagnosis.tests.bookings = `✅ Accessible (${bookingCount} bookings)`;
    } catch (error) {
      diagnosis.tests.bookings = '❌ Error: ' + error.message;
    }

    // JWT test
    diagnosis.tests.jwt = process.env.JWT_SECRET ? '✅ JWT_SECRET available' : '❌ JWT_SECRET not set';

    // Overall status
    const criticalIssues = [
      diagnosis.environment.MONGO_URI.includes('NOT SET'),
      diagnosis.environment.JWT_SECRET.includes('NOT SET'),
      diagnosis.tests.connection.includes('❌'),
      diagnosis.tests.users.includes('❌'),
      diagnosis.tests.bookings.includes('❌'),
      diagnosis.tests.jwt.includes('❌')
    ].filter(Boolean).length;

    diagnosis.overall = {
      status: criticalIssues === 0 ? '✅ ALL SYSTEMS OPERATIONAL' : `❌ ${criticalIssues} ISSUES DETECTED`,
      action_required: criticalIssues > 0 ? 'Set environment variables in Render dashboard' : null
    };

    console.log('📋 Diagnosis:', diagnosis.overall.status);
    res.json(diagnosis);
  });

  // Serve static frontend files (CSS, JS, images)
  app.use(express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.set('Content-Type', 'text/html');
      }
    }
  }));

  // Explicitly handle HTML pages
  const htmlPages = ['index', 'login', 'register', 'dashboard', 'trips', 'booking'];

  htmlPages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
      res.sendFile(path.join(__dirname, `../frontend/${page}.html`));
    });
    
    app.get(`/${page}.html`, (req, res) => {
      res.sendFile(path.join(__dirname, `../frontend/${page}.html`));
    });
  });

  // Root route
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });

  // Catch-all - for any other routes, serve index.html (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Visit: http://localhost:${PORT}`);
    if (mongoConnected) {
      console.log(`✅ MongoDB Connected\n`);
    } else {
      console.log(`⚠️  MongoDB Not Connected - Fix MONGO_URI and redeploy\n`);
    }
  });
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});