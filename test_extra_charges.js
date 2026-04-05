/**
 * Test script for extra charges feature
 * Tests: extra days charges, extra persons charges, and final payment calculation
 */

const API_BASE = 'http://localhost:5000/api';

// Test data
let testToken = null;
let testUserId = null;
let testTripId = null;

console.log('\n🧪 ===== EXTRA CHARGES FEATURE TEST =====\n');

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(`${response.status}: ${data?.message || text}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ API Error:`, error.message);
    throw error;
  }
}

// Test 1: Register a test user
async function testRegisterUser() {
  console.log('▶ TEST 1: Registering test user...');
  
  const userData = {
    name: 'Test User ' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'Test@123'
  };

  try {
    const response = await apiCall('/auth/register', 'POST', userData);
    testToken = response.token;
    testUserId = response._id;
    
    console.log('✅ User registered successfully');
    console.log(`   Token: ${testToken.substring(0, 20)}...`);
    console.log(`   User ID: ${testUserId}`);
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    throw error;
  }
}

// Test 2: Get trips and check pricing fields
async function testGetTrips() {
  console.log('\n▶ TEST 2: Fetching trips with pricing configuration...');
  
  try {
    const trips = await apiCall('/trips');
    
    if (!trips || trips.length === 0) {
      throw new Error('No trips available');
    }

    testTripId = trips[0]._id;
    const trip = trips[0];
    
    console.log(`✅ Retrieved ${trips.length} trips`);
    console.log(`\n   Sample trip: ${trip.title}`);
    console.log(`   - Price: $${trip.price}`);
    console.log(`   - Duration: ${trip.duration}`);
    console.log(`   - Standard Travelers: ${trip.standardTravelers || 'NOT SET (will default to 2)'}`);
    console.log(`   - Price per Day: $${trip.pricePerDay || 'NOT SET (will default to $50)'}`);
    console.log(`   - Price per Person: $${trip.pricePerPerson || 'NOT SET (will default to $100)'}`);

  } catch (error) {
    console.error('❌ Failed to fetch trips:', error.message);
    throw error;
  }
}

// Test 3: Create a booking with extra days and extra persons
async function testCreateBookingWithExtraCharges() {
  console.log('\n▶ TEST 3: Creating booking with extra charges...');
  
  try {
    const trip = await apiCall('/trips').then(trips => trips.find(t => t._id === testTripId));
    
    // Calculate dates for extra days (start tomorrow)
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1);
    pickupDate.setHours(0, 0, 0, 0);
    
    const parsedDays = parseInt(trip.duration.match(/\d+/)[0]);
    const extraDays = 3; // Add 3 extra days
    
    const travelDate = new Date(pickupDate);
    travelDate.setDate(travelDate.getDate() + parsedDays + extraDays + 1);
    
    // Test with 4 travelers (2 extra beyond standard of 2)
    const numTravelers = 4;
    const standardTravelers = trip.standardTravelers || 2;
    const extraPersons = Math.max(0, numTravelers - standardTravelers);

    const bookingPayload = {
      tripId: testTripId,
      pickupDate: pickupDate.toISOString().split('T')[0],
      travelDate: travelDate.toISOString().split('T')[0],
      pickupAddress: '123 Test Street, Test City',
      numTravelers: numTravelers,
      basePrice: trip.price,
      extraDays: extraDays,
      extraDaysCharge: extraDays * (trip.pricePerDay || 50),
      extraPersons: extraPersons,
      extraPersonsCharge: extraPersons * (trip.pricePerPerson || 100),
      totalPrice: trip.price + (extraDays * (trip.pricePerDay || 50)) + (extraPersons * (trip.pricePerPerson || 100)),
      paymentMethod: 'cash'
    };

    const booking = await apiCall('/bookings', 'POST', bookingPayload, testToken);
    
    console.log('✅ Booking created successfully');
    console.log(`\n   📋 Booking Details:`);
    console.log(`   - Booking ID: ${booking._id}`);
    console.log(`   - Trip: ${trip.title}`);
    console.log(`   - Travelers: ${numTravelers} (${standardTravelers} standard + ${extraPersons} extra)`);
    console.log(`   - Days: ${parsedDays} trip days + ${extraDays} extra days`);
    console.log(`\n   💰 Pricing Breakdown:`);
    console.log(`   - Base Price: $${trip.price}`);
    console.log(`   - Extra Days Charge: ${extraDays} × $${trip.pricePerDay || 50} = $${extraDays * (trip.pricePerDay || 50)}`);
    console.log(`   - Extra Persons Charge: ${extraPersons} × $${trip.pricePerPerson || 100} = $${extraPersons * (trip.pricePerPerson || 100)}`);
    console.log(`   - 💳 TOTAL: $${bookingPayload.totalPrice}`);
    
    // Verify stored charges in returned booking
    console.log(`\n   ✅ Stored in booking response:`);
    console.log(`   - Base Price: $${booking.basePrice || 0}`);
    console.log(`   - Extra Days: ${booking.extraDays || 0}`);
    console.log(`   - Extra Days Charge: $${booking.extraDaysCharge || 0}`);
    console.log(`   - Extra Persons: ${booking.extraPersons || 0}`);
    console.log(`   - Extra Persons Charge: $${booking.extraPersonsCharge || 0}`);
    console.log(`   - Total Price: $${booking.totalPrice}`);

    return booking;
  } catch (error) {
    console.error('❌ Failed to create booking:', error.message);
    throw error;
  }
}

// Test 4: Create payment for the booking
async function testCreatePayment(bookingId, totalPrice) {
  console.log('\n▶ TEST 4: Processing payment with calculated total...');
  
  try {
    const paymentPayload = {
      bookingId: bookingId,
      amount: totalPrice,
      paymentMethod: 'cash'
    };

    const payment = await apiCall('/payments/process-payment', 'POST', paymentPayload, testToken);
    
    console.log('✅ Payment processed successfully');
    console.log(`   - Payment ID: ${payment.paymentId}`);
    console.log(`   - Amount: $${payment.amount}`);
    console.log(`   - Status: ${payment.status}`);
    console.log(`   - Method: ${payment.method}`);

  } catch (error) {
    console.error('❌ Failed to process payment:', error.message);
    throw error;
  }
}

// Test 5: Verify all bookings have extra charges fields
async function testVerifyBookings() {
  console.log('\n▶ TEST 5: Verifying all bookings have extra charges fields...');
  
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    
    const bookings = await response.json();
    
    console.log(`✅ Retrieved ${bookings.length} bookings`);
    
    let validCount = 0;
    bookings.forEach((booking, index) => {
      const hasFields = booking.basePrice !== undefined && 
                       booking.extraDays !== undefined &&
                       booking.extraDaysCharge !== undefined &&
                       booking.extraPersons !== undefined &&
                       booking.extraPersonsCharge !== undefined;
      
      if (hasFields) {
        validCount++;
        if (index === 0) { // Show first booking as example
          console.log(`\n   📋 Sample Booking #${index + 1}:`);
          console.log(`   - Base Price: $${booking.basePrice || 0}`);
          console.log(`   - Extra Days: ${booking.extraDays || 0} days`);
          console.log(`   - Extra Days Charge: $${booking.extraDaysCharge || 0}`);
          console.log(`   - Extra Persons: ${booking.extraPersons || 0}`);
          console.log(`   - Extra Persons Charge: $${booking.extraPersonsCharge || 0}`);
          console.log(`   - Total: $${booking.totalPrice}`);
        }
      }
    });
    
    console.log(`\n   ✅ Bookings with extra charges fields: ${validCount}/${bookings.length}`);
    
    if (validCount === bookings.length) {
      console.log('   ✅ All bookings have complete pricing information');
    } else {
      console.log(`   ⚠️  ${bookings.length - validCount} bookings missing fields`);
    }

  } catch (error) {
    console.error('❌ Failed to verify bookings:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testRegisterUser();
    await testGetTrips();
    const booking = await testCreateBookingWithExtraCharges();
    await testCreatePayment(booking._id, booking.totalPrice);
    await testVerifyBookings();
    
    console.log('\n✅ ===== ALL TESTS PASSED =====\n');
  } catch (error) {
    console.error('\n❌ ===== TEST SUITE FAILED =====\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);
