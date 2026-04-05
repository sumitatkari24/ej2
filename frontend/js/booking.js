const API_BASE = '/api';

let allTrips = [];
let selectedTrip = null;
let selectedDate = null;
let currentBooking = null;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Load trips
  loadTrips();

  // Check for trip parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const selectedTripId = urlParams.get('trip');

  // Trip select change event
  document.getElementById('tripSelect').addEventListener('change', showTripDetails);

  // Proceed to date button
  document.getElementById('proceedToDate').addEventListener('click', proceedToDate);
  
  // Back button (from date to trip)
  document.getElementById('backToTrip').addEventListener('click', backToTrip);

  // Proceed to payment button (from date to payment)
  document.getElementById('proceedToPayment').addEventListener('click', proceedToPayment);

  // Payment form submit
  document.getElementById('paymentForm').addEventListener('submit', handlePayment);

  document.getElementById('logout').addEventListener('click', logout);

  // Pre-select trip if provided in URL
  if (selectedTripId) {
    // Wait for trips to load, then select the trip
    setTimeout(() => {
      const tripSelect = document.getElementById('tripSelect');
      if (tripSelect && allTrips.length > 0) {
        tripSelect.value = selectedTripId;
        showTripDetails();
      }
    }, 500);
  }
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
  // Handle both event and direct calls
  let tripId;
  if (e && e.target) {
    tripId = e.target.value;
  } else {
    // Direct call - get value from select element
    tripId = document.getElementById('tripSelect').value;
  }
  
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

function proceedToDate() {
  if (!selectedTrip) {
    alert('Please select a trip first');
    return;
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('travelDate').setAttribute('min', today);
  
  // Show trip details in date step
  const dateStepDetails = document.getElementById('dateStepTripDetails');
  dateStepDetails.innerHTML = `
    <div><strong>Trip:</strong> ${selectedTrip.title}</div>
    <div><strong>Destination:</strong> ${selectedTrip.destination}</div>
    <div><strong>Price:</strong> $${selectedTrip.price}</div>
    <div><strong>Duration:</strong> ${selectedTrip.duration}</div>
  `;

  // Switch to date step
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step-date').classList.remove('hidden');
}

function backToTrip() {
  // Switch back to trip selection
  document.getElementById('step-date').classList.add('hidden');
  document.getElementById('step1').classList.remove('hidden');
  selectedDate = null;
  document.getElementById('travelDate').value = '';
  document.getElementById('pickupDate').value = '';
}

function proceedToPayment() {
  const pickupDate = document.getElementById('pickupDate').value;
  const travelDate = document.getElementById('travelDate').value;
  
  if (!pickupDate) {
    alert('Please select a pickup date');
    return;
  }

  if (!travelDate) {
    alert('Please select a travel date');
    return;
  }

  // Validate pickup date is in the future
  const pickupDateObj = new Date(pickupDate);
  const travelDateObj = new Date(travelDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (pickupDateObj < today) {
    alert('Pickup date must be in the future');
    return;
  }

  if (travelDateObj < today) {
    alert('Travel date must be in the future');
    return;
  }

  if (travelDateObj <= pickupDateObj) {
    alert('Travel date must be after pickup date');
    return;
  }

  selectedDate = travelDate;

  // Show booking details in pickup step
  const pickupStepDetails = document.getElementById('pickupStepDetails');
  pickupStepDetails.innerHTML = `
    <div><strong>Trip:</strong> ${selectedTrip.title}</div>
    <div><strong>Destination:</strong> ${selectedTrip.destination}</div>
    <div><strong>Pickup Date:</strong> ${new Date(pickupDate).toLocaleDateString()}</div>
    <div><strong>Travel Date:</strong> ${new Date(selectedDate).toLocaleDateString()}</div>
    <div><strong>Price:</strong> $${selectedTrip.price}</div>
    <div><strong>Duration:</strong> ${selectedTrip.duration}</div>
  `;

  // Switch to pickup step
  document.getElementById('step-date').classList.add('hidden');
  document.getElementById('step-pickup').classList.remove('hidden');
}

function proceedToPayment() {
  const address = document.getElementById('pickupAddress').value.trim();
  const travelers = document.getElementById('numTravelers').value;
  
  if (!address) {
    alert('Please enter a pickup address');
    return;
  }

  pickupAddress = address;
  numTravelers = parseInt(travelers);

  // Create booking with all details
  createBooking(pickupDate, pickupAddress, numTravelers);
}

async function createBooking(pickupDate, pickupAddress, numTravelers) {
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        tripId: selectedTrip._id,
        pickupDate: pickupDate,
        travelDate: selectedDate,
        pickupAddress: pickupAddress,
        numTravelers: parseInt(numTravelers),
        totalPrice: selectedTrip.price * parseInt(numTravelers),
        paymentMethod: 'cash'
      })
    });
    
    if (!response.ok) {
      const err = await response.json();
      alert(err.message || 'Error creating booking');
      return;
    }

    currentBooking = await response.json();
    
    // Show payment summary
    showPaymentSummary(pickupDate);
    
    // Switch to payment step
    document.getElementById('step-pickup').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
  } catch (error) {
    console.error('Error creating booking:', error);
    alert('Error creating booking: ' + error.message);
  }
}

function showPaymentSummary(pickupDate) {
  const summary = document.getElementById('paymentSummary');
  const pickupDateObj = new Date(pickupDate);
  const travelDateObj = new Date(selectedDate);
  
  const formattedPickupDate = pickupDateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const formattedTravelDate = travelDateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  summary.innerHTML = `
    <div class="flex justify-between"><span>Trip:</span><strong>${selectedTrip.title}</strong></div>
    <div class="flex justify-between"><span>Destination:</span><strong>${selectedTrip.destination}</strong></div>
    <div class="flex justify-between"><span>Duration:</span><strong>${selectedTrip.duration}</strong></div>
    <div class="flex justify-between"><span>Pickup Date:</span><strong>${formattedPickupDate}</strong></div>
    <div class="flex justify-between"><span>Travel Date:</span><strong>${formattedTravelDate}</strong></div>
    <div class="border-t border-teal-300 pt-2 mt-2 flex justify-between text-base font-bold text-teal-600">
      <span>Total Amount:</span>
      <span>$${selectedTrip.price}</span>
    </div>
  `;
}

async function handlePayment(e) {
  e.preventDefault();
  
  if (!currentBooking) {
    alert('Booking not found');
    return;
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
        amount: selectedTrip.price * currentBooking.numTravelers,
        paymentMethod: 'cash'
      })
    });
    
    if (response.ok) {
      alert('✅ Booking confirmed! Payment to be collected at pickup. Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      const err = await response.json();
      alert('❌ ' + (err.message || 'Booking confirmation failed'));
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