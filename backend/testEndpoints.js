const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:5001/api';
  
  console.log('=== Testing API Endpoints ===\n');
  
  // Test health
  try {
    const response = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', response.status, response.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.status, error.response?.data);
  }
  
  // Test stores endpoint
  try {
    const response = await axios.get(`${baseURL}/stores`);
    console.log('✅ Stores endpoint:', response.status, response.data);
  } catch (error) {
    console.log('❌ Stores endpoint failed:', error.response?.status, error.response?.data || error.message);
  }
  
  // Test ratings/user/stats endpoint with mock auth
  try {
    const response = await axios.get(`${baseURL}/ratings/user/stats`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU2ODc1MTcxLCJleHAiOjE3NTY5NjE1NzF9.dummy'
      }
    });
    console.log('✅ User stats endpoint:', response.status, response.data);
  } catch (error) {
    console.log('❌ User stats endpoint failed:', error.response?.status, error.response?.data || error.message);
  }
}

testAPI().catch(console.error);
