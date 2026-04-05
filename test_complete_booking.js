// Test script to verify booking flow with real authentication
const API_BASE = 'http://localhost:5000/api';

// Test data using seeded user
const testUser = {
  email: 'john@example.com',
  password: 'password123'
};

async function testBookingFlow() {
  console.log('🧪 Testing complete booking flow...');

  try {
    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Login failed: ${error.message}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // 2. Get available trips
    console.log('2. Fetching trips...');
    const tripsResponse = await fetch(`${API_BASE}/trips`);
    if (!tripsResponse.ok) {
      throw new Error('Failed to fetch trips');
    }
    const trips = await tripsResponse.json();
    console.log(`✅ Found ${trips.length} trips`);

    // Use the first trip for testing
    const testTrip = trips[0];
    console.log(`   Using trip: ${testTrip.title} (ID: ${testTrip._id})`);

    // 3. Create booking
    console.log('3. Creating booking...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bookingPayload = {
      tripId: testTrip._id,
      pickupDate: tomorrow.toISOString().split('T')[0],
      travelDate: nextWeek.toISOString().split('T')[0],
      pickupAddress: '123 Test Street, Test City',
      numTravelers: 2,
      totalPrice: testTrip.price * 2,
      paymentMethod: 'cash'
    };

    console.log('   Booking details:', {
      trip: testTrip.title,
      pickupDate: bookingPayload.pickupDate,
      travelDate: bookingPayload.travelDate,
      address: bookingPayload.pickupAddress,
      travelers: bookingPayload.numTravelers,
      totalPrice: bookingPayload.totalPrice
    });

    const bookingResponse = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingPayload)
    });

    if (!bookingResponse.ok) {
      const error = await bookingResponse.json();
      throw new Error(`Booking failed: ${error.message}`);
    }

    const booking = await bookingResponse.json();
    console.log('✅ Booking created:', booking._id);

    // 4. Process payment
    console.log('4. Processing payment...');
    const paymentResponse = await fetch(`${API_BASE}/payments/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingId: booking._id,
        amount: booking.totalPrice,
        paymentMethod: 'cash'
      })
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      throw new Error(`Payment failed: ${error.message}`);
    }

    const payment = await paymentResponse.json();
    console.log('✅ Payment processed:', payment.status);

    console.log('🎉 Complete booking flow test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBookingFlow();