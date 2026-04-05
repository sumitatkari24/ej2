const API_BASE = '/api';

const DEFAULT_TRIPS = [
  {
    _id: 'fallback1',
    title: 'Paris City Escape',
    destination: 'France',
    price: 1500,
    duration: '5 days',
    description: 'Experience the magic of Paris with guided tours of the Eiffel Tower, Louvre Museum, and charming streets.',
    imageUrl: 'https://picsum.photos/600/400?random=1',
    fallbackUrl: 'https://picsum.photos/600/400?random=101'
  },
  {
    _id: 'fallback2',
    title: 'Tokyo Adventure',
    destination: 'Japan',
    price: 2000,
    duration: '7 days',
    description: 'Discover ancient temples, modern technology, and vibrant culture in Tokyo. Includes Mt. Fuji day trip.',
    imageUrl: 'https://picsum.photos/600/400?random=2',
    fallbackUrl: 'https://picsum.photos/600/400?random=102'
  },
  {
    _id: 'fallback3',
    title: 'New York Explorer',
    destination: 'USA',
    price: 1800,
    duration: '6 days',
    description: 'Explore Times Square, Central Park, Statue of Liberty, and enjoy world-class dining and Broadway shows.',
    imageUrl: 'https://picsum.photos/600/400?random=3',
    fallbackUrl: 'https://picsum.photos/600/400?random=103'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  fetchTrips();
  loadFeaturedImages();
  
  // Set up modal close handlers
  const closeModalBtn = document.getElementById('closeTripDetailsModal');
  if (closeModalBtn) {
    closeModalBtn.onclick = closeTripDetailsModal;
  }
  
  const modal = document.getElementById('tripDetailsModal');
  if (modal) {
    modal.onclick = (e) => {
      if (e.target.id === 'tripDetailsModal') closeTripDetailsModal();
    };
  }
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => searchTrips(e.target.value));
  }
});

async function fetchTrips() {
  try {
    const response = await fetch(`${API_BASE}/trips`);
    if (!response.ok) {
      throw new Error(`Trips API returned ${response.status}`);
    }
    const trips = await response.json();
    if (!Array.isArray(trips) || trips.length === 0) {
      throw new Error('Trips API returned no trips');
    }
    window.currentTrips = trips;
    displayTrips(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    window.currentTrips = DEFAULT_TRIPS;
    displayTrips(DEFAULT_TRIPS);
  }
}

function searchTrips(query) {
  if (!window.currentTrips) return;
  const filtered = window.currentTrips.filter(trip =>
    trip.title.toLowerCase().includes(query.toLowerCase()) ||
    trip.destination.toLowerCase().includes(query.toLowerCase())
  );
  displayTrips(filtered);
}

function displayTrips(trips) {
  const tripsDiv = document.getElementById('trips');
  tripsDiv.innerHTML = '';
  
  // Display cards with placeholder images first
  trips.forEach(trip => {
    const tripCard = `
      <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 trip-card cursor-pointer">
        <div class="relative h-48 overflow-hidden bg-gradient-to-br from-teal-100 to-blue-100">
          <img 
            id="img-${trip._id}"
            src="${ImageLoader.fallbackImage}" 
            alt="${trip.title}" 
            class="w-full h-full object-cover transition duration-500" 
            data-primary="${trip.imageUrl || ''}"
            data-fallback="${trip.fallbackUrl || ''}"
            loading="lazy">
        </div>
        <div class="p-5">
          <h5 class="text-lg font-bold text-gray-800 mb-2">${trip.title}</h5>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">${trip.description}</p>
          <div class="flex justify-between items-center mb-3">
            <span class="text-teal-600 font-bold text-lg">$${trip.price}</span>
            <span class="text-xs bg-teal-50 text-teal-600 px-3 py-1 rounded-full">${trip.duration}</span>
          </div>
          <p class="text-sm text-gray-500 flex items-center gap-1">
            <span>📍</span> ${trip.destination}
          </p>
        </div>
      </div>
    `;
    tripsDiv.innerHTML += tripCard;
  });

  // Load images asynchronously
  trips.forEach(trip => {
    const imgElement = document.getElementById(`img-${trip._id}`);
    if (imgElement) {
      const primaryUrl = imgElement.getAttribute('data-primary');
      const fallbackUrl = imgElement.getAttribute('data-fallback');
      
      ImageLoader.loadImage(primaryUrl || ImageLoader.fallbackImage, fallbackUrl || null, 6000)
        .then(resolvedUrl => {
          if (imgElement) {
            // Set the image source and fade it in
            imgElement.src = resolvedUrl;
            imgElement.style.opacity = '0';
            imgElement.style.transition = 'opacity 0.4s ease-in';
            
            // Use a timeout to ensure the src change has taken effect
            setTimeout(() => {
              imgElement.style.opacity = '1';
            }, 50);
          }
        })
        .catch(() => {
          if (imgElement) {
            imgElement.src = ImageLoader.fallbackImage;
            imgElement.style.opacity = '1';
          }
        });
    }
  });
}

// Load featured destination images
function loadFeaturedImages() {
  const featuredImages = [
    { id: 'featured-img-1', primary: 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=600&h=400&fit=crop&q=85', fallback: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=85' },
    { id: 'featured-img-2', primary: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&q=85', fallback: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop&q=85' },
    { id: 'featured-img-3', primary: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop&q=85', fallback: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&h=400&fit=crop&q=85' }
  ];

  featuredImages.forEach(async (imageData) => {
    const imgElement = document.getElementById(imageData.id);
    if (imgElement) {
      // Start with loading image
      imgElement.src = ImageLoader.loadingImage;
      imgElement.style.opacity = '1';

      try {
        const resolvedUrl = await ImageLoader.loadImage(imageData.primary, imageData.fallback, 10000);
        if (imgElement && resolvedUrl) {
          ImageLoader.applyImage(imgElement, resolvedUrl, true);
        }
      } catch (error) {
        console.error(`Failed to load featured image ${imageData.id}:`, error);
        if (imgElement) {
          ImageLoader.applyImage(imgElement, ImageLoader.fallbackImage, true);
        }
      }
    }
  });
}

// Trip Details Modal Functions
function openFeaturedTrip(destination) {
  if (!window.currentTrips || window.currentTrips.length === 0) {
    fetchTrips().then(() => {
      const trip = (window.currentTrips || []).find(t => t.destination.toLowerCase() === destination.toLowerCase());
      if (trip) {
        showTripDetails(trip._id);
      } else {
        alert('Sorry, this featured destination is not available right now.');
      }
    }).catch(() => {
      alert('Unable to load trips at the moment. Please try again in a few seconds.');
    });
    return;
  }

  const trip = (window.currentTrips || []).find(t => t.destination.toLowerCase() === destination.toLowerCase());
  if (trip) {
    showTripDetails(trip._id);
  } else {
    alert('Sorry, this featured destination is not available right now.');
  }
}

async function showTripDetails(tripId) {
  if (!window.currentTrips || window.currentTrips.length === 0) {
    await fetchTrips();
  }

  const trip = (window.currentTrips || []).find(t => t._id === tripId);
  if (!trip) {
    alert('Trip details could not be loaded. Please try again soon.');
    return;
  }

  // Populate modal with trip data
  const imgElement = document.getElementById('tripDetailsImage');

  // Load image with ImageLoader for proper handling
  imgElement.src = ImageLoader.loadingImage;
  imgElement.style.opacity = '1';

  ImageLoader.loadImage(trip.imageUrl || ImageLoader.fallbackImage, trip.fallbackUrl || null, 8000)
    .then(resolvedUrl => {
      if (imgElement) {
        ImageLoader.applyImage(imgElement, resolvedUrl, true);
      }
    })
    .catch((error) => {
      console.error(`Failed to load image for trip details ${trip._id}:`, error);
      if (imgElement) {
        ImageLoader.applyImage(imgElement, ImageLoader.fallbackImage, true);
      }
    });

  document.getElementById('tripDetailsTitle').textContent = trip.title;
  document.getElementById('tripDetailsDestination').textContent = trip.destination;
  document.getElementById('tripDetailsDuration').textContent = trip.duration;
  document.getElementById('tripDetailsPrice').textContent = `$${trip.price}`;
  document.getElementById('tripDetailsDescription').textContent = trip.description || 'No description available.';

  // Set up book now button
  document.getElementById('bookFromDetails').onclick = () => {
    closeTripDetailsModal();
    window.location.href = `booking.html?tripId=${trip._id}`;
  };

  // Show modal
  document.getElementById('tripDetailsModal').classList.remove('hidden');
}

function closeTripDetailsModal() {
  document.getElementById('tripDetailsModal').classList.add('hidden');
}