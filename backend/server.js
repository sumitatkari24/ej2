const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// load env from backend/.env (since server is run from project root)
dotenv.config({ path: __dirname + '/.env' });

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes (MUST come before static files)
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: process.env.MONGO_URI ? 'Configured' : 'Not configured',
    timestamp: new Date()
  });
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});