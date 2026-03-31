const express = require('express');
const Trip = require('../models/Trip');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Sample trips for when database is not available
const sampleTrips = [
  {
    _id: 'sample1',
    title: 'Paris City Escape',
    destination: 'France',
    price: 1500,
    duration: '5 days',
    description: 'Experience the magic of Paris with guided tours of the Eiffel Tower, Louvre Museum, and charming streets.',
    imageUrl: 'https://picsum.photos/600/400?random=1',
    fallbackUrl: 'https://picsum.photos/600/400?random=101'
  },
  {
    _id: 'sample2',
    title: 'Tokyo Adventure',
    destination: 'Japan',
    price: 2000,
    duration: '7 days',
    description: 'Discover ancient temples, modern technology, and vibrant culture in Tokyo. Includes Mt. Fuji day trip.',
    imageUrl: 'https://picsum.photos/600/400?random=2',
    fallbackUrl: 'https://picsum.photos/600/400?random=102'
  },
  {
    _id: 'sample3',
    title: 'New York Explorer',
    destination: 'USA',
    price: 1800,
    duration: '6 days',
    description: 'Explore Times Square, Central Park, Statue of Liberty, and enjoy world-class dining and Broadway shows.',
    imageUrl: 'https://picsum.photos/600/400?random=3',
    fallbackUrl: 'https://picsum.photos/600/400?random=103'
  },
  {
    _id: 'sample4',
    title: 'Rome Historical Tour',
    destination: 'Italy',
    price: 1600,
    duration: '5 days',
    description: 'Walk through history visiting the Colosseum, Vatican, Roman Forum, and enjoy authentic Italian cuisine.',
    imageUrl: 'https://picsum.photos/600/400?random=4',
    fallbackUrl: 'https://picsum.photos/600/400?random=104'
  },
  {
    _id: 'sample5',
    title: 'Barcelona Beach & Culture',
    destination: 'Spain',
    price: 1400,
    duration: '5 days',
    description: 'Enjoy beautiful beaches, Sagrada Familia, Park Güell, and vibrant nightlife in Barcelona.',
    imageUrl: 'https://picsum.photos/600/400?random=5',
    fallbackUrl: 'https://picsum.photos/600/400?random=105'
  },
  {
    _id: 'sample6',
    title: 'London Royal Experience',
    destination: 'United Kingdom',
    price: 1700,
    duration: '5 days',
    description: 'Visit Buckingham Palace, Tower Bridge, Big Ben, and explore royal history and museums.',
    imageUrl: 'https://picsum.photos/600/400?random=6',
    fallbackUrl: 'https://picsum.photos/600/400?random=106'
  },
  {
    _id: 'sample7',
    title: 'Dubai Luxury Getaway',
    destination: 'United Arab Emirates',
    price: 2200,
    duration: '6 days',
    description: 'Experience luxury, desert safari, Burj Khalifa, and world-class shopping in Dubai.',
    imageUrl: 'https://picsum.photos/600/400?random=7',
    fallbackUrl: 'https://picsum.photos/600/400?random=107'
  },
  {
    _id: 'sample8',
    title: 'Singapore Modern Marvel',
    destination: 'Singapore',
    price: 1900,
    duration: '4 days',
    description: 'Explore Marina Bay Sands, Gardens by the Bay, and diverse cultural neighborhoods in Singapore.',
    imageUrl: 'https://picsum.photos/600/400?random=8',
    fallbackUrl: 'https://picsum.photos/600/400?random=108'
  },
  {
    _id: 'sample9',
    title: 'Bangkok Thai Experience',
    destination: 'Thailand',
    price: 1200,
    duration: '5 days',
    description: 'Discover ancient temples, floating markets, street food, and the vibrant energy of Bangkok.',
    imageUrl: 'https://picsum.photos/600/400?random=9',
    fallbackUrl: 'https://picsum.photos/600/400?random=109'
  },
  {
    _id: 'sample10',
    title: 'Sydney Harbor Escape',
    destination: 'Australia',
    price: 2100,
    duration: '6 days',
    description: 'Visit iconic Sydney Opera House and Harbour Bridge, plus beautiful beaches and wildlife.',
    imageUrl: 'https://picsum.photos/600/400?random=10',
    fallbackUrl: 'https://picsum.photos/600/400?random=110'
  }
];

// Get all trips
router.get('/', async (req, res) => {
  console.log('GET /api/trips called');
  // Since MongoDB is not connected, just return sample trips
  console.log('Returning sample trips, count:', sampleTrips.length);
  res.json(sampleTrips);
});

// Create trip (admin only)
router.post('/', protect, admin, async (req, res) => {
  const { title, destination, price, duration, description, imageUrl } = req.body;
  try {
    const trip = await Trip.create({
      title,
      destination,
      price,
      duration,
      description,
      imageUrl
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update trip (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete trip (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, sampleTrips };