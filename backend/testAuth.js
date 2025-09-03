// Simple auth flow tester without axios (Node 18+ fetch)
(async () => {
  const base = 'http://localhost:' + (process.env.PORT || '5001') + '/api';

  const logSection = (title) => console.log('\n==== ' + title + ' ====');

  async function get(url) {
    const res = await fetch(url);
    const text = await res.text();
    console.log('GET', url.replace(base, ''), '->', res.status, text);
    return { res, text };
  }
  async function post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    let jsonText = await res.text();
    try { jsonText = JSON.stringify(JSON.parse(jsonText), null, 2); } catch (_) {}
    console.log('POST', url.replace(base, ''), '->', res.status, '\n', jsonText);
    return { res, body: jsonText };
  }

  try {
    logSection('HEALTH');
    await get(base + '/health');

    logSection('ADMIN LOGIN');
    await post(base + '/auth/login', { email: 'admin@storerating.com', password: 'Admin@123' });

    const unique = Date.now();
    const testEmail = `test${unique}@example.com`;
    const name = 'Test Automation User XXXX'; // length > 20
    const password = 'Strong@123A'; // meets policy

    logSection('REGISTER TEST USER');
    await post(base + '/auth/register', { name, email: testEmail, password, address: 'Sample Address 1' });

    logSection('LOGIN TEST USER');
    await post(base + '/auth/login', { email: testEmail, password });

  } catch (e) {
    console.error('Test script error:', e);
  }
})();
