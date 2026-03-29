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
  trips.forEach(trip => {
    const tripCard = `
      <div class="col-md-4">
        <div class="card">
          <img src="${trip.imageUrl}" class="card-img-top" alt="${trip.title}">
          <div class="card-body">
            <h5 class="card-title">${trip.title}</h5>
            <p class="card-text">${trip.description}</p>
            <p class="card-text"><strong>Price: $${trip.price}</strong></p>
            <p class="card-text">Duration: ${trip.duration}</p>
            <p class="card-text">Destination: ${trip.destination}</p>
          </div>
        </div>
      </div>
    `;
    tripsDiv.innerHTML += tripCard;
  });
}