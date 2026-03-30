const API_BASE = '/api';

let allTrips = [];
let selectedTrip = null;
let currentBooking = null;

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

  // Proceed to payment button
  document.getElementById('proceedToPayment').addEventListener('click', proceedToPayment);
  
  // Back button
  document.getElementById('backToTrip').addEventListener('click', backToTrip);

  // Payment form submit
  document.getElementById('paymentForm').addEventListener('submit', handlePayment);
  
  // Payment method change
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', updateCardFields);
  });

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
    selectedTrip = null;
    return;
  }
  
  selectedTrip = allTrips.find(t => t._id === tripId);
  if (selectedTrip) {
    detailsDiv.innerHTML = `
      <div><strong>Title:</strong> ${selectedTrip.title}</div>
      <div><strong>Destination:</strong> ${selectedTrip.destination}</div>
      <div><strong>Price:</strong> $${selectedTrip.price}</div>
      <div><strong>Duration:</strong> ${selectedTrip.duration}</div>
      <div><strong>Description:</strong> ${selectedTrip.description}</div>
    `;
    detailsPanel.classList.remove('hidden');
  }
}

function proceedToPayment() {
  if (!selectedTrip) {
    alert('Please select a trip first');
    return;
  }

  // Create booking first
  createBooking();
}

async function createBooking() {
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ tripId: selectedTrip._id })
    });
    
    if (!response.ok) {
      const err = await response.json();
      alert(err.message || 'Error creating booking');
      return;
    }

    currentBooking = await response.json();
    
    // Show payment summary
    showPaymentSummary();
    
    // Switch to payment step
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
  } catch (error) {
    console.error('Error creating booking:', error);
    alert('Error creating booking: ' + error.message);
  }
}

function showPaymentSummary() {
  const summary = document.getElementById('paymentSummary');
  summary.innerHTML = `
    <div class="flex justify-between"><span>Trip:</span><strong>${selectedTrip.title}</strong></div>
    <div class="flex justify-between"><span>Destination:</span><strong>${selectedTrip.destination}</strong></div>
    <div class="flex justify-between"><span>Duration:</span><strong>${selectedTrip.duration}</strong></div>
    <div class border-t border-teal-300 pt-2 mt-2 flex justify-between text-base font-bold text-teal-600">
      <span>Total Amount:</span>
      <span>$${selectedTrip.price}</span>
    </div>
  `;
}

function updateCardFields() {
  const method = document.querySelector('input[name="paymentMethod"]:checked').value;
  const cardFields = document.getElementById('cardFields');
  const upiFields = document.getElementById('upiFields');
  
  if (method === 'card') {
    cardFields.classList.remove('hidden');
    upiFields.classList.add('hidden');
  } else if (method === 'upi') {
    cardFields.classList.add('hidden');
    upiFields.classList.remove('hidden');
  } else {
    cardFields.classList.add('hidden');
    upiFields.classList.add('hidden');
  }
}

function backToTrip() {
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step1').classList.remove('hidden');
  currentBooking = null;
}

async function handlePayment(e) {
  e.preventDefault();
  
  if (!currentBooking) {
    alert('Booking not found');
    return;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  // Validate based on payment method
  if (paymentMethod === 'card') {
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;

    if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
      alert('Please fill in all card fields');
      return;
    }

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      alert('Invalid card number');
      return;
    }
    if (cardCVV.length !== 3 && cardCVV.length !== 4) {
      alert('Invalid CVV');
      return;
    }
  } else if (paymentMethod === 'upi') {
    const upiId = document.getElementById('upiId').value;
    
    if (!upiId) {
      alert('Please enter UPI ID');
      return;
    }
    
    // Validate UPI format (simple validation)
    if (!upiId.includes('@')) {
      alert('Invalid UPI ID format. Use format like: name@upi');
      return;
    }
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing Payment...';

  try {
    const response = await fetch(`${API_BASE}/payments/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        bookingId: currentBooking._id,
        amount: selectedTrip.price,
        paymentMethod: paymentMethod
      })
    });
    
    if (response.ok) {
      alert('✅ Payment successful! Your trip is booked. Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      const err = await response.json();
      alert('❌ ' + (err.message || 'Payment failed'));
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment error: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}