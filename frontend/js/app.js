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
  const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e0e0e0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="24" font-family="Arial"%3EImage Not Available%3C/text%3E%3C/svg%3E';
  
  trips.forEach(trip => {
    const tripCard = `
      <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 trip-card cursor-pointer">
        <div class="relative h-48 overflow-hidden bg-gray-200">
          <img src="${trip.imageUrl}" 
               alt="${trip.title}" 
               class="w-full h-full object-cover" 
               onerror="this.src='${fallbackImage}'"
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
}