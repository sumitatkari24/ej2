const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';
    if (!mongoUri) {
      console.warn('⚠️  MONGO_URI not set or empty. Set this environment variable to enable database.');
      return false;
    }

    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.warn('⚠️  Unable to connect to MongoDB. Fix MONGO_URI, network access, or Atlas IP whitelist.');
    return false;
  }
};

module.exports = connectDB;