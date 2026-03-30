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
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-fa9d91a5aacc?w=600&h=400&fit=crop'
  },
  {
    title: 'Tokyo Adventure',
    destination: 'Japan',
    price: 2000,
    duration: '7 days',
    description: 'Discover ancient temples, modern technology, and vibrant culture in Tokyo. Includes Mt. Fuji day trip.',
    imageUrl: 'https://images.unsplash.com/photo-1540959375944-7049f642e9b4?w=600&h=400&fit=crop'
  },
  {
    title: 'New York Explorer',
    destination: 'USA',
    price: 1800,
    duration: '6 days',
    description: 'Explore Times Square, Central Park, Statue of Liberty, and enjoy world-class dining and Broadway shows.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop'
  },
  {
    title: 'Rome Historical Tour',
    destination: 'Italy',
    price: 1600,
    duration: '5 days',
    description: 'Walk through history visiting the Colosseum, Vatican, Roman Forum, and enjoy authentic Italian cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1552832860-f8f59aadde34?w=600&h=400&fit=crop'
  },
  {
    title: 'Barcelona Beach & Culture',
    destination: 'Spain',
    price: 1400,
    duration: '5 days',
    description: 'Enjoy beautiful beaches, Sagrada Familia, Park Güell, and vibrant nightlife in Barcelona.',
    imageUrl: 'https://images.unsplash.com/photo-1561883088-039b36bb7812?w=600&h=400&fit=crop'
  },
  {
    title: 'London Royal Experience',
    destination: 'United Kingdom',
    price: 1700,
    duration: '5 days',
    description: 'Visit Buckingham Palace, Tower Bridge, Big Ben, and explore royal history and museums.',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop'
  },
  {
    title: 'Dubai Luxury Getaway',
    destination: 'United Arab Emirates',
    price: 2200,
    duration: '6 days',
    description: 'Experience luxury, desert safari, Burj Khalifa, and world-class shopping in Dubai.',
    imageUrl: 'https://images.unsplash.com/photo-1512453909227-1aa32ffb1042?w=600&h=400&fit=crop'
  },
  {
    title: 'Singapore Modern Marvel',
    destination: 'Singapore',
    price: 1900,
    duration: '4 days',
    description: 'Explore Marina Bay Sands, Gardens by the Bay, and diverse cultural neighborhoods in Singapore.',
    imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919abe?w=600&h=400&fit=crop'
  },
  {
    title: 'Bangkok Thai Experience',
    destination: 'Thailand',
    price: 1200,
    duration: '5 days',
    description: 'Discover ancient temples, floating markets, street food, and the vibrant energy of Bangkok.',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop'
  },
  {
    title: 'Sydney Harbor Escape',
    destination: 'Australia',
    price: 2100,
    duration: '6 days',
    description: 'Visit iconic Sydney Opera House and Harbour Bridge, plus beautiful beaches and wildlife.',
    imageUrl: 'https://images.unsplash.com/photo-1506973404872-a4fa82d67c47?w=600&h=400&fit=crop'
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
