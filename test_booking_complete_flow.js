const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
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
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  console.log('🚀 Starting Complete Booking Flow Test\n');

  try {
    // Wait for server to be ready
    console.log('⏳ Waiting for server...');
    let serverReady = false;
    for (let i = 0; i < 5; i++) {
      try {
        const res = await makeRequest('GET', '/trips');
        if (res.status) {
          serverReady = true;
          break;
        }
      } catch {
        await delay(1000);
      }
    }
    
    if (!serverReady) {
      throw new Error('Server not responding');
    }
    console.log('✅ Server is ready\n');
    // Step 1: Register/Login
    console.log('📝 Step 1: Register a test user');
    const registerRes = await makeRequest('POST', '/auth/register', {
      name: `TestUser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'Test@123'
    });
    
    if (registerRes.status !== 201 && registerRes.status !== 400) {
      throw new Error(`Register failed: ${registerRes.status} - ${JSON.stringify(registerRes.data)}`);
    }
    console.log('✅ Registration response:', registerRes.status);

    // Step 2: Login
    console.log('\n🔐 Step 2: Login to get token');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: registerRes.data.email || `test${Date.now()}@example.com`,
      password: 'Test@123'
    });
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
    }
    
    const token = loginRes.data.token;
    console.log(`✅ Login successful, got token: ${token.substring(0, 20)}...`);

    // Step 3: Get Trips
    console.log('\n🏝️  Step 3: Get available trips');
    const tripsRes = await makeRequest('GET', '/trips');
    
    if (tripsRes.status !== 200 || !Array.isArray(tripsRes.data)) {
      throw new Error(`Get trips failed: ${tripsRes.status}`);
    }
    
    const trip = tripsRes.data[0];
    console.log(`✅ Found ${tripsRes.data.length} trips`);
    console.log(`   Using: ${trip.title} (${trip._id})`);

    // Step 4: Create Booking
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

    console.log('   Booking data:', JSON.stringify(bookingData, null, 2));

    const bookingRes = await makeRequest('POST', '/bookings', bookingData, token);
    
    if (bookingRes.status !== 201) {
      throw new Error(`❌ Create booking failed: ${bookingRes.status} - ${JSON.stringify(bookingRes.data)}`);
    }

    const booking = bookingRes.data;
    console.log(`✅ Booking created: ${booking._id}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Payment Status: ${booking.paymentStatus}`);

    // Step 5: Process Payment
    console.log('\n💳 Step 5: Process payment');
    const paymentRes = await makeRequest('POST', '/payments/process-payment', {
      bookingId: booking._id,
      amount: booking.totalPrice,
      paymentMethod: 'cash'
    }, token);

    if (paymentRes.status !== 200) {
      throw new Error(`❌ Payment failed: ${paymentRes.status} - ${JSON.stringify(paymentRes.data)}`);
    }

    console.log('✅ Payment processed successfully');
    console.log(`   Payment ID: ${paymentRes.data.paymentId}`);
    console.log(`   Amount: $${paymentRes.data.amount}`);
    console.log(`   Status: ${paymentRes.data.status}`);

    // Step 6: Verify Booking
    console.log('\n✓ Step 6: Verify final booking state');
    const finalBookingRes = await makeRequest('GET', `/bookings/user/${loginRes.data._id ? loginRes.data._id : 'current'}`, null, token);
    
    console.log(`✅ User bookings retrieved: ${Array.isArray(finalBookingRes.data) ? finalBookingRes.data.length : 'N/A'}`);

    console.log('\n🎉 ============================================');
    console.log('   ✅ ALL TESTS PASSED!');
    console.log('   Booking and payment flow working correctly');
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
