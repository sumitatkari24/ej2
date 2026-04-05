const API_BASE = '/api';

let allTrips = [];
let selectedTrip = null;
let selectedDate = null;
let pickupAddress = '';
let numTravelers = 1;
let currentBooking = null;
let pendingTripSelection = null;

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
  const selectedTripId = urlParams.get('trip') || urlParams.get('tripId');

  // Trip select change event
  document.getElementById('tripSelect').addEventListener('change', showTripDetails);

  // Proceed to date button
  document.getElementById('proceedToDate').addEventListener('click', proceedToDate);
  
  // Back button (from date to trip)
  document.getElementById('backToTrip').addEventListener('click', backToTrip);

  // Proceed to payment button (from date to payment)
  document.getElementById('proceedToPayment').addEventListener('click', proceedToPayment);

  // Back button (from payment to date)
  const backToDateBtn = document.getElementById('backToDate');
  if (backToDateBtn) {
    backToDateBtn.addEventListener('click', backToDate);
  }

  // Payment form submit
  document.getElementById('paymentForm').addEventListener('submit', handlePayment);

  document.getElementById('logout').addEventListener('click', logout);

  // Pre-select trip if provided in URL
  if (selectedTripId) {
    pendingTripSelection = selectedTripId;
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

    if (pendingTripSelection) {
      const pendingOption = allTrips.find(trip => trip._id === pendingTripSelection);
      if (pendingOption) {
        tripSelect.value = pendingTripSelection;
        showTripDetails();
      }
      pendingTripSelection = null;
    }
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

function backToDate() {
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step-date').classList.remove('hidden');
}

async function proceedToPayment() {
  if (!selectedTrip || !selectedTrip._id) {
    alert('Please select a trip first');
    return;
  }

  const pickupDate = document.getElementById('pickupDate').value;
  const travelDate = document.getElementById('travelDate').value;
  const address = document.getElementById('pickupAddress')?.value.trim() || '';
  const travelers = document.getElementById('numTravelers')?.value || '1';

  if (!pickupDate) {
    alert('Please select a pickup date');
    return;
  }

  if (!travelDate) {
    alert('Please select a travel date');
    return;
  }

  if (!address) {
    alert('Please enter a pickup address');
    return;
  }

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
  pickupAddress = address;
  numTravelers = parseInt(travelers, 10);

  console.log('📝 Proceeding to payment with:');
  console.log('   Trip:', selectedTrip._id);
  console.log('   Pickup Date:', pickupDate);
  console.log('   Travel Date:', travelDate);
  console.log('   Address:', address);

  const bookingResult = await createBooking(pickupDate, pickupAddress, numTravelers);
  if (!bookingResult || !bookingResult._id) {
    console.error('Booking failed - result:', bookingResult);
    return;
  }

  currentBooking = bookingResult;

  showPaymentSummary(pickupDate);
  document.getElementById('step-date').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
}

async function createBooking(pickupDate, pickupAddress, numTravelers) {
  if (!selectedTrip || !selectedTrip._id) {
    console.error('❌ Selected trip is missing');
    alert('Selected trip is missing. Please choose a trip again.');
    return null;
  }

  const bookingPayload = { 
    tripId: selectedTrip._id,
    pickupDate,
    travelDate: selectedDate,
    pickupAddress,
    numTravelers: parseInt(numTravelers, 10) || 1,
    totalPrice: selectedTrip.price * (parseInt(numTravelers, 10) || 1),
    paymentMethod: 'cash'
  };

  console.log('📤 Sending booking request to /api/bookings');
  console.log('   Payload:', bookingPayload);
  console.log('   Token present:', !!localStorage.getItem('token'));

  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(bookingPayload)
    });
    
    console.log('📥 Response status:', response.status);
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      console.error('❌ Invalid JSON response:', responseText);
      alert('❌ Server Error: Invalid response from server');
      return null;
    }
    
    if (!response.ok) {
      const errorMessage = responseData.message || 'Failed to create booking';
      console.error('❌ Booking creation failed:', {
        status: response.status,
        message: errorMessage,
        data: responseData
      });
      alert('❌ Booking Error: ' + errorMessage);
      return null;
    }

    console.log('✅ Booking created successfully:', responseData._id);
    return responseData;
  } catch (error) {
    console.error('❌ Network error creating booking:', error);
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    alert('❌ Network error: ' + error.message);
    return null;
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
      <span>$${selectedTrip.price * numTravelers}</span>
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
    if (!currentBooking._id) {
      const bookingResult = await createBooking(
        currentBooking.pickupDate,
        currentBooking.pickupAddress,
        currentBooking.numTravelers
      );

      if (!bookingResult || !bookingResult._id) {
        alert('Unable to create booking before payment. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }

      currentBooking = bookingResult;
    }

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