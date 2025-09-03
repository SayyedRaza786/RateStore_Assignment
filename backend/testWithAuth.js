const axios = require('axios');

async function testWithAuth() {
  try {
    console.log('=== Testing API with Authentication ===\n');
    
    // First login to get a valid token (using the actual user account)
    console.log('1. Logging in to get token...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'sraza8903@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Login successful for: ${user.name} (${user.role})`);
    console.log(`Token: ${token.substring(0, 20)}...`);
    
    // Create axios instance with auth header
    const apiClient = axios.create({
      baseURL: 'http://localhost:5001/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test stores endpoint
    console.log('\n2. Testing /api/stores with auth...');
    const storesResponse = await apiClient.get('/stores');
    console.log(`✅ Stores: ${storesResponse.data.length} stores found`);
    storesResponse.data.forEach(store => {
      console.log(`  - ${store.name} (${store.averageRating ? store.averageRating.toFixed(1) : 'No'} rating)`);
    });
    
    // Test user stats endpoint
    console.log('\n3. Testing /api/ratings/user/stats with auth...');
    const statsResponse = await apiClient.get('/ratings/user/stats');
    console.log('✅ User stats:', statsResponse.data);
    
    console.log('\n🎉 All API endpoints working with authentication!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWithAuth();
