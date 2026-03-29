const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend'), {
  extensions: ['html', 'css', 'js', 'json']
}));

// Route handler for HTML pages without extensions
app.get('/:page', (req, res) => {
  const filePath = path.join(__dirname, '../frontend', req.params.page + '.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      // If file doesn't exist, send index.html
      res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
  });
});

// Catch-all for root and undefined routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});