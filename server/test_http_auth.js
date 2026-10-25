const assert = require('assert');
const http = require('http');

async function testHttpEndpoints() {
  console.log('🌐 Testing Express HTTP Auth Routes & HttpOnly Cookies...\n');

  // Require and start app
  require('dotenv').config();
  const express = require('express');
  const app = require('./src/app');
  const { initDb } = require('./src/db/connection');
  const { migrate } = require('./src/db/migrate');
  const { connectMongo } = require('./src/db/mongo');

  await connectMongo();
  await initDb();
  migrate();

  const PORT = 3099;
  process.env.PORT = PORT;

  const server = http.createServer(app);

  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`🚀 Test server listening on http://127.0.0.1:${PORT}`);

  const makeRequest = (path, method = 'GET', body = null, cookie = null) => {
    return new Promise((resolve, reject) => {
      const dataString = body ? JSON.stringify(body) : null;
      const headers = { 'Content-Type': 'application/json' };
      if (dataString) headers['Content-Length'] = Buffer.byteLength(dataString);
      if (cookie) headers['Cookie'] = cookie;

      const req = http.request({
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers
      }, (res) => {
        let respBody = '';
        res.on('data', chunk => { respBody += chunk; });
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(respBody); } catch { parsed = respBody; }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            cookies: res.headers['set-cookie']
          });
        });
      });
      req.on('error', reject);
      if (dataString) req.write(dataString);
      req.end();
    });
  };

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'ok');
    console.log('✅ Health check passed. Status 200 OK');

    // 2. Register endpoint
    const regEmail = `http_user_${Date.now()}@test.tims`;
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      email: regEmail,
      password: 'StrongPassword123!',
      full_name: 'HTTP Traveler',
      username: `traveler_${Date.now()}`
    });
    assert.strictEqual(regRes.status, 201, `Registration failed: ${JSON.stringify(regRes.body)}`);
    assert(regRes.cookies, 'Registration must return Set-Cookie');
    assert(regRes.cookies[0].includes('HttpOnly'), 'Cookie must have HttpOnly flag');
    console.log('✅ POST /api/auth/register passed. HttpOnly cookie set:', regRes.cookies[0].split(';')[0]);

    const sessionCookie = regRes.cookies[0].split(';')[0];

    // 3. Test protected profile route using HttpOnly cookie (no Bearer header!)
    const profileRes = await makeRequest('/api/auth/profile', 'GET', null, sessionCookie);
    assert.strictEqual(profileRes.status, 200);
    assert.strictEqual(profileRes.body.user.email, regEmail);
    console.log('✅ GET /api/auth/profile with HttpOnly cookie authenticated user:', profileRes.body.user.email);

    // 4. Test Phone OTP flow
    const phone = '+15559876543';
    const otpSendRes = await makeRequest('/api/auth/phone/send-otp', 'POST', { phone });
    assert.strictEqual(otpSendRes.status, 200);
    assert(otpSendRes.body.devCode, 'Dev mode returns OTP code for testing');
    console.log('✅ POST /api/auth/phone/send-otp passed. Dispatched code:', otpSendRes.body.devCode);

    const otpVerifyRes = await makeRequest('/api/auth/phone/verify-otp', 'POST', {
      phone,
      otp: otpSendRes.body.devCode,
      full_name: 'SMS Verified Traveler'
    });
    assert.strictEqual(otpVerifyRes.status, 200);
    assert(otpVerifyRes.cookies, 'OTP verification must return Set-Cookie');
    assert(otpVerifyRes.cookies[0].includes('HttpOnly'), 'OTP cookie must have HttpOnly flag');
    assert.strictEqual(otpVerifyRes.body.user.phone, phone);
    console.log('✅ POST /api/auth/phone/verify-otp passed. Authenticated phone user with HttpOnly cookie.');

    // 5. Test Logout & Session Invalidation
    const logoutRes = await makeRequest('/api/auth/logout', 'POST', null, sessionCookie);
    assert.strictEqual(logoutRes.status, 200);
    console.log('✅ POST /api/auth/logout succeeded.');

    // 6. Verify that accessing protected route with invalidated session is rejected (401)
    const afterLogoutRes = await makeRequest('/api/auth/profile', 'GET', null, sessionCookie);
    assert.strictEqual(afterLogoutRes.status, 401, 'Invalidated session must return 401 Unauthorized');
    console.log('✅ Protected route correctly rejected invalidated session with 401 Unauthorized.');

    console.log('\n🎉 ALL REAL HTTP AUTH & COOKIE TESTS PASSED SUCCESSFULLY!\n');
  } finally {
    server.close();
    await require('./src/db/mongo').mongoose.disconnect();
    process.exit(0);
  }
}

testHttpEndpoints().catch(err => {
  console.error('❌ HTTP Test failed:', err);
  process.exit(1);
});
