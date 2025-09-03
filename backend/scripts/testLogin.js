// Simple raw HTTP test for login endpoint without external deps
const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ email, password });
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const start = Date.now();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('\n=== LOGIN TEST RESULT ===');
        console.log('Email:', email);
        console.log('Status:', res.statusCode);
        console.log('Time  :', Date.now() - start + 'ms');
        console.log('Body  :', body);
        resolve();
      });
    });
    req.on('error', (err) => {
      console.log('\n=== LOGIN TEST ERROR ===');
      console.log('Email:', email);
      console.error(err.message);
      resolve();
    });
    req.write(payload);
    req.end();
  });
}

(async () => {
  await testLogin('admin@storerating.com', 'Admin@123');
  // Deliberate wrong password test
  await testLogin('admin@storerating.com', 'WrongPass1!');
  // Non-existing user test
  await testLogin('nouser'+Date.now()+'@example.com', 'SomePass1!');
})();
