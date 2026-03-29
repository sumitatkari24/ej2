const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('bookingForm').addEventListener('submit', handleBooking);

  document.getElementById('logout').addEventListener('click', logout);
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function handleBooking(e) {
  e.preventDefault();
  const tripId = document.getElementById('tripId').value.trim();

  if (!tripId) {
    alert('Please enter a Trip ID to book.');
    return;
  }

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
      alert('Trip booked successfully');
      window.location.href = 'dashboard.html';
    } else {
      const err = await response.json();
      alert(err.message || 'Error booking trip');
    }
  } catch (error) {
    console.error('Error booking trip:', error);
    alert('Network error booking trip, try again.');
  }
}