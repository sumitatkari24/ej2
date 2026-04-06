#!/usr/bin/env node

// URGENT RENDER ENVIRONMENT VARIABLE VERIFICATION SCRIPT
// Run this to get the exact values you need to copy to Render

const fs = require('fs');
const path = require('path');

console.log('🚨 URGENT RENDER ENVIRONMENT VARIABLE VERIFICATION\n');

try {
  // Read the .env file
  const envPath = path.join(__dirname, 'backend', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');

  console.log('📋 EXACT VALUES TO COPY TO RENDER DASHBOARD:\n');

  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.includes('MONGO_URI=')) {
      const mongoUri = line.split('=')[1].trim();
      console.log('🔴 MONGO_URI (COPY THIS EXACTLY):');
      console.log(mongoUri);
      console.log('');
    }
    if (line.includes('JWT_SECRET=')) {
      const jwtSecret = line.split('=')[1].trim();
      console.log('🔴 JWT_SECRET (COPY THIS EXACTLY):');
      console.log(jwtSecret);
      console.log('');
    }
  });

  console.log('📝 INSTRUCTIONS:');
  console.log('1. Go to https://dashboard.render.com');
  console.log('2. Select your "trip-management-system" service');
  console.log('3. Click "Environment" tab');
  console.log('4. Click "Add Environment Variable"');
  console.log('5. Copy-paste the values above EXACTLY');
  console.log('6. Save and redeploy');
  console.log('');

  console.log('⚡ AFTER SETTING VARIABLES:');
  console.log('- Visit your-app.onrender.com/api/health');
  console.log('- Should show "mongodb": "Connected ✅"');
  console.log('- Test registration/booking - data will save to MongoDB');

} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  console.log('💡 Make sure backend/.env exists with MONGO_URI and JWT_SECRET');
}