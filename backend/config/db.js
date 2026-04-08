const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';
    if (!mongoUri) {
      console.warn('⚠️  MONGO_URI not set or empty. Set this environment variable to enable database.');
      return false;
    }

    // More robust connection options for production/Render
    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 30000,  // Increased timeout
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,  // Connection pool
      bufferCommands: false,  // Disable mongoose buffering
      maxIdleTimeMS: 30000,
      family: 4  // Use IPv4
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    // Monitor connection state
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Runtime Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.error('❌ MongoDB Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected');
    });

    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('   Full error:', error);
    console.warn('⚠️  Unable to connect to MongoDB. Fix MONGO_URI, network access, or Atlas IP whitelist.');
    return false;
  }
};

// Helper function to check if DB is really available
const isDBAvailable = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return false;
    }
    // Test with a simple operation
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ DB Availability Check Failed:', error.message);
    return false;
  }
};

module.exports = { connectDB, isDBAvailable };