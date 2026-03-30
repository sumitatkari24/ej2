const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trip = require('../models/Trip');

dotenv.config({ path: __dirname + '/../.env' });

const sampleTrips = [
  {
    title: 'Paris City Escape',
    destination: 'France',
    price: 1500,
    duration: '5 days',
    description: 'Experience the magic of Paris with guided tours of the Eiffel Tower, Louvre Museum, and charming streets.',
    imageUrl: 'https://images.unsplash.com/photo-1495788466985-89c0e6a0f9a6?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Tokyo Adventure',
    destination: 'Japan',
    price: 2000,
    duration: '7 days',
    description: 'Discover ancient temples, modern technology, and vibrant culture in Tokyo. Includes Mt. Fuji day trip.',
    imageUrl: 'https://images.unsplash.com/photo-1540959375944-7049f642e9a5?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'New York Explorer',
    destination: 'USA',
    price: 1800,
    duration: '6 days',
    description: 'Explore Times Square, Central Park, Statue of Liberty, and enjoy world-class dining and Broadway shows.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Rome Historical Tour',
    destination: 'Italy',
    price: 1600,
    duration: '5 days',
    description: 'Walk through history visiting the Colosseum, Vatican, Roman Forum, and enjoy authentic Italian cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1552832860-8bdde8b76a8f?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Barcelona Beach & Culture',
    destination: 'Spain',
    price: 1400,
    duration: '5 days',
    description: 'Enjoy beautiful beaches, Sagrada Familia, Park Güell, and vibrant nightlife in Barcelona.',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'London Royal Experience',
    destination: 'United Kingdom',
    price: 1700,
    duration: '5 days',
    description: 'Visit Buckingham Palace, Tower Bridge, Big Ben, and explore royal history and museums.',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Dubai Luxury Getaway',
    destination: 'United Arab Emirates',
    price: 2200,
    duration: '6 days',
    description: 'Experience luxury, desert safari, Burj Khalifa, and world-class shopping in Dubai.',
    imageUrl: 'https://images.unsplash.com/photo-1512453333346-f8d1655ae898?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Singapore Modern Marvel',
    destination: 'Singapore',
    price: 1900,
    duration: '4 days',
    description: 'Explore Marina Bay Sands, Gardens by the Bay, and diverse cultural neighborhoods in Singapore.',
    imageUrl: 'https://images.unsplash.com/photo-1531912537782-18cdf4e27e0d?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Bangkok Thai Experience',
    destination: 'Thailand',
    price: 1200,
    duration: '5 days',
    description: 'Discover ancient temples, floating markets, street food, and the vibrant energy of Bangkok.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=60'
  },
  {
    title: 'Sydney Harbor Escape',
    destination: 'Australia',
    price: 2100,
    duration: '6 days',
    description: 'Visit iconic Sydney Opera House and Harbour Bridge, plus beautiful beaches and wildlife.',
    imageUrl: 'https://images.unsplash.com/photo-1506565520897-7ab210a8e008?auto=format&fit=crop&w=500&q=60'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Check if trips already exist
    const existingTrips = await Trip.countDocuments();
    if (existingTrips > 0) {
      console.log(`Database already has ${existingTrips} trips. Skipping seed.`);
      await mongoose.connection.close();
      return;
    }

    // Insert sample trips
    const result = await Trip.insertMany(sampleTrips);
    console.log(`Successfully seeded ${result.length} trips to database!`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
