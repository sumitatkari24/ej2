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
  console.log('Displaying trips:', trips.length, 'trips');
  const tripsDiv = document.getElementById('trips');
  if (!tripsDiv) {
    console.error('Trips div not found!');
    return;
  }
  tripsDiv.innerHTML = '';
  
  if (!trips || trips.length === 0) {
    tripsDiv.innerHTML = '<div class="col-span-1"><p class="text-gray-500 text-center">No trips found.</p></div>';
    return;
  }
  
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
          <p class="text-sm text-gray-500 flex items-center gap-1 mb-4">
            <span>📍</span> ${trip.destination}
          </p>
          <button onclick="showTripDetails('${trip._id}')" class="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105">
            Book Now
          </button>
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
      console.log('Loading image for trip:', trip._id, primaryUrl);
      
      ImageLoader.loadImage(primaryUrl || ImageLoader.fallbackImage, fallbackUrl || null, 6000)
        .then(resolvedUrl => {
          console.log('Image loaded for trip:', trip._id, resolvedUrl);
          if (imgElement) {
            ImageLoader.applyImage(imgElement, resolvedUrl, true);
          }
        })
        .catch((error) => {
          console.error('Failed to load image for trip:', trip._id, error);
          if (imgElement) {
            ImageLoader.applyImage(imgElement, ImageLoader.fallbackImage, true);
          }
        });
    }
  });
}

// Load featured destination images
function loadFeaturedImages() {
  console.log('Loading featured images...');
  const featuredImages = [
    { id: 'featured-img-1', primary: 'https://picsum.photos/800/600?random=101', fallback: 'https://picsum.photos/800/600?random=201' },
    { id: 'featured-img-2', primary: 'https://picsum.photos/800/600?random=102', fallback: 'https://picsum.photos/800/600?random=202' },
    { id: 'featured-img-3', primary: 'https://picsum.photos/800/600?random=103', fallback: 'https://picsum.photos/800/600?random=203' }
  ];

  featuredImages.forEach(async (imageData) => {
    console.log('Loading featured image:', imageData.id);
    const imgElement = document.getElementById(imageData.id);
    if (imgElement) {
      // Start with loading image
      imgElement.src = ImageLoader.loadingImage;
      imgElement.style.opacity = '1';

      try {
        const resolvedUrl = await ImageLoader.loadImage(imageData.primary, imageData.fallback, 10000);
        console.log('Featured image loaded:', imageData.id, resolvedUrl);
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
    window.bookTrip(trip._id);
  };

  // Show modal
  document.getElementById('tripDetailsModal').classList.remove('hidden');
}

// Make showTripDetails function globally accessible for onclick handlers
window.showTripDetails = showTripDetails;

function closeTripDetailsModal() {
  document.getElementById('tripDetailsModal').classList.add('hidden');
}