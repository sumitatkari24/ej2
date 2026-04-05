const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  
  // Only redirect to login if trying to access user-specific features
  // Allow browsing trips without login
  
  fetchTrips();

  const logoutMain = document.getElementById('logout');
  const logoutSidebar = document.getElementById('logoutSidebar');
  const logoutMobile = document.getElementById('logoutMobile');
  const goBooking = document.getElementById('goBookingPage');
  const refreshTrips = document.getElementById('refreshTrips');
  const searchInput = document.getElementById('searchInput');

  if (logoutMain) logoutMain.addEventListener('click', logout);
  if (logoutSidebar) logoutSidebar.addEventListener('click', logout);
  if (logoutMobile) logoutMobile.addEventListener('click', logout);
  if (goBooking) goBooking.addEventListener('click', () => {
    if (!token) {
      window.location.href = 'login.html';
    } else {
      window.location.href = 'booking.html';
    }
  });
  if (refreshTrips) refreshTrips.addEventListener('click', fetchTrips);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (window.allTrips) {
        const filtered = window.allTrips.filter(trip =>
          trip.title.toLowerCase().includes(query) || trip.destination.toLowerCase().includes(query)
        );
        displayTrips(filtered);
      }
    });
  }
  
  // Update UI based on login status
  updateUIBasedOnAuth(token);
});

function logout(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function fetchTrips() {
  try {
    const response = await fetch(`${API_BASE}/trips`);
    const trips = await response.json();
    window.allTrips = trips;
    displayTrips(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
  }
}

function displayTrips(trips) {
  const tripsDiv = document.getElementById('trips');
  tripsDiv.innerHTML = '';

  if (!trips.length) {
    tripsDiv.innerHTML = '<div class="col-span-1"><p class="text-gray-500 text-center">No trips found.</p></div>';
    return;
  }

  // Display cards with placeholder images first
  trips.forEach(trip => {
    const status = trip.status || 'Available';
    const card = document.createElement('div');
    card.className = 'bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-xl transition';
    
    card.innerHTML = `
      <div class="relative h-56 overflow-hidden bg-gradient-to-br from-teal-100 to-blue-100">
        <img 
          id="img-${trip._id}"
          src="${ImageLoader.fallbackImage}" 
          class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
          alt="${trip.title}"
          data-primary="${trip.imageUrl || ''}"
          data-fallback="${trip.fallbackUrl || ''}"
          loading="lazy">
        <span class="absolute top-4 right-4 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">${status}</span>
      </div>
      <div class="p-6">
        <h4 class="text-xl font-bold text-gray-800">${trip.title}</h4>
        <p class="text-gray-500 text-sm mb-4">${trip.duration}</p>
        <p class="text-sm text-gray-500 mb-4">${trip.description?.substring(0, 80) || 'No description'}...</p>
        <div class="flex justify-between items-center pt-4 border-t border-gray-50">
          <span class="text-gray-400 text-sm"><i data-lucide="users"></i> 1+ People</span>
          <span class="font-bold text-teal-600">$${trip.price}</span>
        </div>
        <button class="mt-4 w-full bg-teal-600 text-white py-2 rounded-xl font-semibold hover:bg-teal-700" onclick="bookTrip('${trip._id}')">Book Now</button>
      </div>
    `;
    tripsDiv.appendChild(card);
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

async function bookTrip(tripId) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tripId })
    });
    if (response.ok) {
      alert('Trip booked successfully');
      window.location.href = 'dashboard.html';
    } else {
      alert('Error booking trip');
    }
  } catch (error) {
    console.error('Error booking trip:', error);
    alert('Error booking trip');
  }
}

function updateUIBasedOnAuth(token) {
  const logoutElements = ['logout', 'logoutSidebar', 'logoutMobile'];
  const bookingElements = ['goBookingPage'];
  
  if (!token) {
    // Hide logout buttons
    logoutElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    
    // Change "Plan New Trip" to "Login to Book"
    bookingElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = 'Login to Book';
        el.onclick = () => window.location.href = 'login.html';
      }
    });
  } else {
    // Show logout buttons
    logoutElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    
    // Keep "Plan New Trip" as is
    bookingElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = 'Plan New Trip';
        el.onclick = () => window.location.href = 'booking.html';
      }
    });
  }
}
}