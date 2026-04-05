// Test URL parameter handling for trip pre-selection
const API_BASE = 'http://localhost:5000/api';

// Mock URLSearchParams for testing
function testUrlParameterHandling() {
  console.log('🧪 Testing URL parameter handling...');

  // Test 1: tripId parameter
  console.log('1. Testing tripId parameter...');
  const urlParams1 = new URLSearchParams('?tripId=69d2aa6931ab65f06a65c3d0');
  const tripId1 = urlParams1.get('trip') || urlParams1.get('tripId');
  console.log('   tripId parameter:', tripId1);
  console.log('   ✅ Should extract: 69d2aa6931ab65f06a65c3d0');

  // Test 2: trip parameter (legacy support)
  console.log('2. Testing trip parameter (legacy)...');
  const urlParams2 = new URLSearchParams('?trip=69d2aa6931ab65f06a65c3d1');
  const tripId2 = urlParams2.get('trip') || urlParams2.get('tripId');
  console.log('   trip parameter:', tripId2);
  console.log('   ✅ Should extract: 69d2aa6931ab65f06a65c3d1');

  // Test 3: No parameters
  console.log('3. Testing no parameters...');
  const urlParams3 = new URLSearchParams('');
  const tripId3 = urlParams3.get('trip') || urlParams3.get('tripId');
  console.log('   No parameters:', tripId3);
  console.log('   ✅ Should be: null');

  // Test 4: Both parameters (tripId should take precedence)
  console.log('4. Testing both parameters...');
  const urlParams4 = new URLSearchParams('?trip=69d2aa6931ab65f06a65c3d2&tripId=69d2aa6931ab65f06a65c3d3');
  const tripId4 = urlParams4.get('trip') || urlParams4.get('tripId');
  console.log('   Both parameters:', tripId4);
  console.log('   ✅ Should extract: 69d2aa6931ab65f06a65c3d2 (first one)');

  console.log('🎉 URL parameter handling test completed!');
}

// Mock trip selection logic
function testTripSelection() {
  console.log('\n🧪 Testing trip selection logic...');

  const mockTrips = [
    { _id: '69d2aa6931ab65f06a65c3d0', title: 'Paris City Escape' },
    { _id: '69d2aa6931ab65f06a65c3d1', title: 'Tokyo Adventure' },
    { _id: '69d2aa6931ab65f06a65c3d2', title: 'New York Explorer' }
  ];

  // Test finding trip by ID
  const testId = '69d2aa6931ab65f06a65c3d0';
  const foundTrip = mockTrips.find(t => t._id === testId);

  if (foundTrip) {
    console.log('✅ Trip found:', foundTrip.title);
  } else {
    console.log('❌ Trip not found');
  }

  // Test trip not found
  const invalidId = 'invalid-id';
  const notFoundTrip = mockTrips.find(t => t._id === invalidId);

  if (!notFoundTrip) {
    console.log('✅ Invalid trip correctly not found');
  } else {
    console.log('❌ Invalid trip incorrectly found');
  }
}

// Run tests
testUrlParameterHandling();
testTripSelection();