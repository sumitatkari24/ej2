const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  fetchTrips();
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => searchTrips(e.target.value));
  }
});

async function fetchTrips() {
  try {
    const response = await fetch(`${API_BASE}/trips`);
    const trips = await response.json();
    window.currentTrips = trips;
    displayTrips(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
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
            imgElement.src = resolvedUrl;
            imgElement.style.opacity = '0';
            imgElement.onload = () => {
              imgElement.style.transition = 'opacity 0.4s ease-in';
              imgElement.style.opacity = '1';
            };
          }
        })
        .catch(() => {
          if (imgElement) {
            imgElement.src = ImageLoader.fallbackImage;
          }
        });
    }
  });
}