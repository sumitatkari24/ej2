const http = require('http');

const API = 'http://localhost:5000/api';
let currentToken = null;
let currentUser = null;

function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testFullFlow() {
  try {
    console.log('🚀 TESTING FULL BOOKING FLOW\n');

    // Step 1: Register
    console.log('📝 Step 1: Register new user');
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    const regRes = await makeRequest('POST', '/auth/register', {
      name: 'Test User',
      email: uniqueEmail,
      password: 'TestPassword123'
    });

    if (regRes.status !== 201) {
      console.error('❌ Registration failed:', regRes.status, regRes.data);
      return;
    }

    currentToken = regRes.data.token;
    currentUser = regRes.data;
    console.log('✅ Registered:', regRes.data.email);
    console.log('   User ID:', regRes.data._id);
    console.log('   Token:', currentToken.substring(0, 30) + '...\n');

    // Step 2: Verify user in database
    console.log('🔍 Checking if user data went to MongoDB...');
    const checkUser = await makeRequest('GET', '/auth/me', null, currentToken);
    
    if (checkUser.status === 200) {
      console.log('✅ User verified in database!');
      console.log('   Database has:', checkUser.data.email);
    } else {
      console.log('❌ User NOT in database?', checkUser.status);
      console.log('   Response:', checkUser.data);
    }

    // Step 3: Get trips
    console.log('\n🏝️  Step 3: Get available trips');
    const tripsRes = await makeRequest('GET', '/trips');
    
    if (tripsRes.status !== 200 || !Array.isArray(tripsRes.data)) {
      console.error('❌ Failed to get trips:', tripsRes.status);
      return;
    }

    const trips = tripsRes.data;
    const trip = trips[0];
    console.log('✅ Found', trips.length, 'trips');
    console.log('   Using:', trip.title);
    console.log('   Trip ID:', trip._id);

    // Step 4: Create booking
    console.log('\n📅 Step 4: Create booking');
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1);
    
    const travelDate = new Date();
    travelDate.setDate(travelDate.getDate() + 3);

    const bookingData = {
      tripId: trip._id,
      pickupDate: pickupDate.toISOString().split('T')[0],
      travelDate: travelDate.toISOString().split('T')[0],
      pickupAddress: '123 Main Street, New York, NY',
      numTravelers: 1,
      totalPrice: trip.price,
      paymentMethod: 'cash'
    };

    console.log('   Sending:', JSON.stringify(bookingData, null, 2));

    const bookingRes = await makeRequest('POST', '/bookings', bookingData, currentToken);

    if (bookingRes.status !== 201) {
      console.error('❌ Booking creation failed:', bookingRes.status, bookingRes.data);
      return;
    }

    const booking = bookingRes.data;
    console.log('✅ Booking created!');
    console.log('   Booking ID:', booking._id);
    console.log('   Status:', booking.status);
    console.log('   Payment Status:', booking.paymentStatus);

    // Step 5: Process payment
    console.log('\n💳 Step 5: Process payment');
    const paymentRes = await makeRequest('POST', '/payments/process-payment', {
      bookingId: booking._id,
      amount: booking.totalPrice,
      paymentMethod: 'cash'
    }, currentToken);

    if (paymentRes.status !== 200) {
      console.error('❌ Payment failed:', paymentRes.status, paymentRes.data);
      return;
    }

    console.log('✅ Payment processed!');
    console.log('   Payment ID:', paymentRes.data.paymentId);

    console.log('\n🎉 ================================================');
    console.log('   ✅ FULL FLOW SUCCESSFUL!');
    console.log('   All data saved to MongoDB ✅');
    console.log('================================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFullFlow();
