const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/diagnose',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const diagnosis = JSON.parse(data);
      console.log('🔍 DIAGNOSTIC RESULTS:');
      console.log('================================');
      console.log('Environment Variables:');
      console.log('  MONGO_URI:', diagnosis.environment.MONGO_URI);
      console.log('  JWT_SECRET:', diagnosis.environment.JWT_SECRET);
      console.log('');
      console.log('MongoDB Status:');
      console.log('  Connected:', diagnosis.mongodb.mongooseConnected);
      console.log('  Host:', diagnosis.mongodb.connectionHost);
      console.log('  Database:', diagnosis.mongodb.connectionName);
      console.log('');
      console.log('Tests:');
      Object.entries(diagnosis.tests).forEach(([test, result]) => {
        console.log(`  ${test}: ${result}`);
      });
      console.log('');
      console.log('Overall Status:', diagnosis.overall.status);
      console.log('Summary:', diagnosis.overall.summary);
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();