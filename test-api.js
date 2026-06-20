const axios = require('axios');

async function test() {
  try {
    const login = await axios.post('http://localhost:4000/api/v1/auth/admin-login', {
      email: 'admin@tago.io',
      password: 'tago@123'
    });
    
    console.log("Login successful, token:", login.data.accessToken.substring(0, 15) + '...');
    
    const stats = await axios.get('http://localhost:4000/api/v1/admin/stats/overview', {
      headers: { Authorization: `Bearer ${login.data.accessToken}` }
    });
    
    console.log("Stats fetched:", Object.keys(stats.data));
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}

test();
