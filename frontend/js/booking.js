const API_BASE = '/api';

let allTrips = [];

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Load trips
  loadTrips();

  // Trip select change event
  document.getElementById('tripSelect').addEventListener('change', showTripDetails);

  document.getElementById('bookingForm').addEventListener('submit', handleBooking);
  document.getElementById('logout').addEventListener('click', logout);
});

function logout(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function loadTrips() {
  try {
    const response = await fetch(`${API_BASE}/trips`);
    allTrips = await response.json();
    
    const tripSelect = document.getElementById('tripSelect');
    tripSelect.innerHTML = '<option value="">Select a Trip</option>';
    
    if (allTrips.length === 0) {
      tripSelect.innerHTML = '<option value="">No trips available</option>';
      tripSelect.disabled = true;
      return;
    }
    
    allTrips.forEach(trip => {
      const option = document.createElement('option');
      option.value = trip._id;
      option.textContent = `${trip.title} - ${trip.destination} ($${trip.price})`;
      tripSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading trips:', error);
    alert('Error loading trips: ' + error.message);
  }
}

function showTripDetails(e) {
  const tripId = e.target.value;
  const detailsPanel = document.getElementById('tripDetailsPanel');
  const detailsDiv = document.getElementById('tripDetails');
  
  if (!tripId) {
    detailsPanel.classList.add('hidden');
    return;
  }
  
  const trip = allTrips.find(t => t._id === tripId);
  if (trip) {
    detailsDiv.innerHTML = `
      <div><strong>Title:</strong> ${trip.title}</div>
      <div><strong>Destination:</strong> ${trip.destination}</div>
      <div><strong>Price:</strong> $${trip.price}</div>
      <div><strong>Duration:</strong> ${trip.duration}</div>
      <div><strong>Description:</strong> ${trip.description}</div>
    `;
    detailsPanel.classList.remove('hidden');
  }
}

async function handleBooking(e) {
  e.preventDefault();
  const tripId = document.getElementById('tripSelect').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (!tripId) {
    alert('Please select a trip to book.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Booking...';

  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ tripId })
    });
    
    if (response.ok) {
      alert('Trip booked successfully! Redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    } else {
      const err = await response.json();
      alert(err.message || 'Error booking trip');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } catch (error) {
    console.error('Error booking trip:', error);
    alert('Network error booking trip, try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}