const API_BASE = '/api';

const dashboard = {
  totalTrips: 0,
  totalBookings: 0,
  revenue: 0,
  bookings: []
};

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  document.getElementById('welcomeText').innerText = `Hi, ${user.name || 'Traveler'}! 👋`;

  if (user.role === 'admin') {
    document.getElementById('adminPanel').classList.remove('hidden');
    fetchTripsForAdmin();
  }

  fetchUserBookings(user._id);

  document.getElementById('logoutSidebar').addEventListener('click', logout);

  const addTripBtn = document.getElementById('addTripBtn');
  if (addTripBtn) addTripBtn.addEventListener('click', promptAddTrip);
});

function logout(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function fetchUserBookings(userId) {
  try {
    const response = await fetch(`${API_BASE}/bookings/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Unable to fetch bookings');

    const bookings = await response.json();
    dashboard.bookings = bookings;
    dashboard.totalBookings = bookings.length;
    updateStats();
    displayBookings(bookings);
    updateNextTrip(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
  }
}

function displayBookings(bookings) {
  const bookingList = document.getElementById('bookingList');
  bookingList.innerHTML = '';
  if (!bookings.length) {
    bookingList.innerHTML = '<p class="text-gray-500">No bookings yet.</p>';
    return;
  }

  bookings.forEach(booking => {
    const card = document.createElement('div');
    card.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100';
    const dateText = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A';
    const price = booking.tripId?.price || 0;
    dashboard.totalTrips += 1;
    dashboard.revenue += price;

    card.innerHTML = `
      <div class="flex justify-between items-start gap-4">
        <div>
          <h4 class="text-lg font-semibold">${booking.tripId?.title || 'Untitled Trip'}</h4>
          <p class="text-sm text-gray-500">${booking.tripId?.destination || ''}</p>
          <p class="text-sm text-gray-500">Booked on ${dateText}</p>
        </div>
        <span class="text-sm font-medium px-3 py-1 rounded-full ${booking.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}">${booking.status}</span>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <p class="text-sm text-slate-500">Price: $${price}</p>
        ${booking.status === 'booked' ? `<button class="text-rose-600 font-semibold hover:text-rose-700" onclick="cancelBooking('${booking._id}')">Cancel</button>` : ''}
      </div>
    `;

    bookingList.appendChild(card);
  });

  updateStats();
}

function updateStats() {
  document.getElementById('totalTrips').innerText = dashboard.totalTrips || 0;
  document.getElementById('totalBookings').innerText = dashboard.totalBookings || 0;
  document.getElementById('revenueEstimate').innerText = `$${dashboard.revenue.toFixed(2)}`;
}

function updateNextTrip(bookings) {
  const active = bookings.filter(b => b.status === 'booked');
  if (!active.length) {
    document.getElementById('nextTripTitle').innerText = 'No upcoming trip';
    document.getElementById('nextTripDate').innerText = 'Add a booking to see next adventure';
    return;
  }

  const sorted = active.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
  const next = sorted[0];

  document.getElementById('nextTripTitle').innerText = next.tripId?.title || 'Upcoming Trip';
  document.getElementById('nextTripDate').innerText = `Booked for ${new Date(next.bookingDate).toLocaleDateString()}`;
}

async function fetchTripsForAdmin() {
  try {
    const response = await fetch(`${API_BASE}/trips`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const trips = await response.json();
    displayAllTrips(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
  }
}

function displayAllTrips(trips) {
  const tripsDiv = document.getElementById('allTrips');
  tripsDiv.innerHTML = '';
  if (!trips.length) {
    tripsDiv.innerHTML = '<p class="text-gray-500">No trips available.</p>';
    return;
  }

  trips.forEach(trip => {
    const item = document.createElement('div');
    item.className = 'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start justify-between gap-4';
    item.innerHTML = `
      <div>
        <h4 class="font-semibold text-slate-800 text-lg">${trip.title}</h4>
        <p class="text-sm text-gray-500">${trip.destination} - $${trip.price} • ${trip.duration}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="deleteTrip('${trip._id}')" class="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
      </div>
    `;
    tripsDiv.appendChild(item);
  });
}

async function promptAddTrip() {
  const title = prompt('Trip title');
  if (!title) return;
  const destination = prompt('Destination');
  if (!destination) return;
  const price = prompt('Price');
  const duration = prompt('Duration');
  const description = prompt('Description');
  const imageUrl = prompt('Image URL');

  try {
    const response = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, destination, price, duration, description, imageUrl })
    });

    if (response.ok) {
      alert('Trip added successfully');
      fetchTripsForAdmin();
    } else {
      alert('Error adding trip');
    }
  } catch (error) {
    console.error('Error adding trip:', error);
  }
}

async function deleteTrip(tripId) {
  try {
    const response = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      alert('Trip deleted');
      fetchTripsForAdmin();
    } else {
      alert('Error deleting trip');
    }
  } catch (error) {
    console.error('Error deleting trip:', error);
  }
}

async function cancelBooking(bookingId) {
  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      alert('Booking cancelled');
      const user = JSON.parse(localStorage.getItem('user'));
      fetchUserBookings(user._id);
    } else {
      alert('Error cancelling booking');
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
  }
}

// Notification Modal Functions
document.addEventListener('DOMContentLoaded', () => {
  const notificationBtn = document.getElementById('notificationBtn');
  const profileBtn = document.getElementById('profileBtn');
  
  if (notificationBtn) {
    notificationBtn.addEventListener('click', openNotificationModal);
  }
  if (profileBtn) {
    profileBtn.addEventListener('click', openProfileModal);
  }

  // Close modals when clicking outside
  document.getElementById('notificationModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'notificationModal') closeNotificationModal();
  });
  document.getElementById('profileModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'profileModal') closeProfileModal();
  });
}, { once: true });

function openNotificationModal() {
  const modal = document.getElementById('notificationModal');
  modal.classList.remove('hidden');
  
  const notificationList = document.getElementById('notificationList');
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Load notifications (for now, show booking updates)
  const bookings = dashboard.bookings || [];
  if (bookings.length === 0) {
    notificationList.innerHTML = '<p class="text-gray-500 text-center py-8">No notifications yet</p>';
    return;
  }
  
  notificationList.innerHTML = bookings.map(booking => `
    <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p class="font-semibold text-gray-800">${booking.tripId?.title || 'Trip Update'}</p>
      <p class="text-sm text-gray-600">Status: <span class="font-medium capitalize">${booking.status}</span></p>
      <p class="text-xs text-gray-500 mt-1">${new Date(booking.bookingDate).toLocaleDateString()}</p>
    </div>
  `).join('');
}

function closeNotificationModal() {
  document.getElementById('notificationModal').classList.add('hidden');
}

function openProfileModal() {
  const modal = document.getElementById('profileModal');
  modal.classList.remove('hidden');
  
  const user = JSON.parse(localStorage.getItem('user'));
  document.getElementById('profileName').innerText = user.name || 'User';
  document.getElementById('profileEmail').innerText = user.email || 'N/A';
  document.getElementById('profileRole').innerText = `Role: ${user.role || 'user'}`;
  document.getElementById('profileBookings').innerText = dashboard.totalBookings || 0;
  document.getElementById('profileJoined').innerText = new Date(user.createdAt || Date.now()).toLocaleDateString();
}

function closeProfileModal() {
  document.getElementById('profileModal').classList.add('hidden');
}

function logoutFromProfile() {
  closeProfileModal();
  logout();
}
