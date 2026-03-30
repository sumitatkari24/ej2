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
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-fa9d91a5aacc?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'Tokyo Adventure',
    destination: 'Japan',
    price: 2000,
    duration: '7 days',
    description: 'Discover ancient temples, modern technology, and vibrant culture in Tokyo. Includes Mt. Fuji day trip.',
    imageUrl: 'https://images.unsplash.com/photo-1540959375944-7049f642e9b4?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1522383550075-cda281e57408?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'New York Explorer',
    destination: 'USA',
    price: 1800,
    duration: '6 days',
    description: 'Explore Times Square, Central Park, Statue of Liberty, and enjoy world-class dining and Broadway shows.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1460872328235-98def848f5d9?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'Rome Historical Tour',
    destination: 'Italy',
    price: 1600,
    duration: '5 days',
    description: 'Walk through history visiting the Colosseum, Vatican, Roman Forum, and enjoy authentic Italian cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1552832860-f8f59aadde34?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'Barcelona Beach & Culture',
    destination: 'Spain',
    price: 1400,
    duration: '5 days',
    description: 'Enjoy beautiful beaches, Sagrada Familia, Park Güell, and vibrant nightlife in Barcelona.',
    imageUrl: 'https://images.unsplash.com/photo-1561883088-039b36bb7812?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1583390334519-150acf02583e?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'London Royal Experience',
    destination: 'United Kingdom',
    price: 1700,
    duration: '5 days',
    description: 'Visit Buckingham Palace, Tower Bridge, Big Ben, and explore royal history and museums.',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'Dubai Luxury Getaway',
    destination: 'United Arab Emirates',
    price: 2200,
    duration: '6 days',
    description: 'Experience luxury, desert safari, Burj Khalifa, and world-class shopping in Dubai.',
    imageUrl: 'https://images.unsplash.com/photo-1512453909227-1aa32ffb1042?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1467614240623-ec7e4bba3871?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'Singapore Modern Marvel',
    destination: 'Singapore',
    price: 1900,
    duration: '4 days',
    description: 'Explore Marina Bay Sands, Gardens by the Bay, and diverse cultural neighborhoods in Singapore.',
    imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919abe?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'Bangkok Thai Experience',
    destination: 'Thailand',
    price: 1200,
    duration: '5 days',
    description: 'Discover ancient temples, floating markets, street food, and the vibrant energy of Bangkok.',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1552520206-7600a8ba0e0a?h=400&w=600&fit=crop&q=85'
  },
  {
    title: 'Sydney Harbor Escape',
    destination: 'Australia',
    price: 2100,
    duration: '6 days',
    description: 'Visit iconic Sydney Opera House and Harbour Bridge, plus beautiful beaches and wildlife.',
    imageUrl: 'https://images.unsplash.com/photo-1506973404872-a4fa82d67c47?h=400&w=600&fit=crop&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1483389127117-b6a2102724ae?h=400&w=600&fit=crop&q=85'
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
