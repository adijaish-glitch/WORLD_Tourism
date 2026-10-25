const assert = require('assert');
const http = require('http');

async function runGoogleOAuthTests() {
  console.log('🧪 Starting Comprehensive Google OAuth 2.0 Security & Flow Tests...\n');

  process.env.NODE_ENV = 'test';
  process.env.GOOGLE_CLIENT_ID = 'test-tims-google-client-id.apps.googleusercontent.com';
  process.env.JWT_SECRET = 'test_jwt_secret_google_oauth_suite';

  const app = require('./src/app');
  const { initDb } = require('./src/db/connection');
  const { migrate } = require('./src/db/migrate');
  const { connectMongo } = require('./src/db/mongo');
  const userService = require('./src/services/userService');
  const bcrypt = require('bcryptjs');

  await connectMongo();
  await initDb();
  migrate();

  const PORT = 3098;
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`🚀 Test server listening on http://127.0.0.1:${PORT}`);

  const makeRequest = (path, method = 'GET', body = null, cookie = null, authHeader = null) => {
    return new Promise((resolve, reject) => {
      const dataString = body ? JSON.stringify(body) : null;
      const headers = { 'Content-Type': 'application/json' };
      if (dataString) headers['Content-Length'] = Buffer.byteLength(dataString);
      if (cookie) headers['Cookie'] = cookie;
      if (authHeader) headers['Authorization'] = authHeader;

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
    // -------------------------------------------------------------
    // Test 1: Missing Google Credential
    // -------------------------------------------------------------
    console.log('▶ Test 1: Missing Google Credential Token...');
    const missingRes = await makeRequest('/api/auth/oauth/google', 'POST', {});
    assert.strictEqual(missingRes.status, 400);
    assert(missingRes.body && missingRes.body.error && missingRes.body.error.includes('credential token is required'));
    console.log('  ✅ Correctly rejected missing credential with 400 Bad Request');

    // -------------------------------------------------------------
    // Test 2: Expired Google Token
    // -------------------------------------------------------------
    console.log('▶ Test 2: Expired Google Token...');
    const expiredRes = await makeRequest('/api/auth/oauth/google', 'POST', {
      credential: 'test_google_expired'
    });
    assert.strictEqual(expiredRes.status, 400);
    assert(expiredRes.body.error.includes('expired'));
    console.log('  ✅ Correctly rejected expired Google token with error:', expiredRes.body.error);

    // -------------------------------------------------------------
    // Test 3: Audience Mismatch (Wrong Client ID)
    // -------------------------------------------------------------
    console.log('▶ Test 3: Audience Mismatch / Unauthorized Client ID...');
    const audRes = await makeRequest('/api/auth/oauth/google', 'POST', {
      credential: 'test_google_wrong_audience'
    });
    assert.strictEqual(audRes.status, 400);
    assert(audRes.body.error.includes('mismatch'));
    console.log('  ✅ Correctly rejected audience mismatch with error:', audRes.body.error);

    // -------------------------------------------------------------
    // Test 4: Unverified Email in Google Account
    // -------------------------------------------------------------
    console.log('▶ Test 4: Unverified Email in Google Profile...');
    const unverRes = await makeRequest('/api/auth/oauth/google', 'POST', {
      credential: 'test_google_unverified_email'
    });
    assert.strictEqual(unverRes.status, 400);
    assert(unverRes.body.error.includes('not verified'));
    console.log('  ✅ Correctly rejected unverified email token with error:', unverRes.body.error);

    // -------------------------------------------------------------
    // Test 5: Successful Google Registration & Session Creation
    // -------------------------------------------------------------
    console.log('▶ Test 5: Successful Google OAuth Registration...');
    const validRes = await makeRequest('/api/auth/oauth/google', 'POST', {
      credential: 'test_google_valid',
      remember_me: true
    });
    assert.strictEqual(validRes.status, 200, `Expected 200, got ${validRes.status}`);
    assert(validRes.body.token, 'Must return JWT token');
    assert.strictEqual(validRes.body.user.email, 'test.google.traveler@example.com');
    assert.strictEqual(validRes.body.user.role, 'customer', 'Google registered user must strictly have customer role, never admin');
    assert(validRes.cookies, 'Set-Cookie must be present for session');
    assert(validRes.cookies[0].includes('HttpOnly'), 'Cookie must have HttpOnly flag');
    console.log('  ✅ Created customer user with secure session and HttpOnly cookie');

    const googleSessionCookie = validRes.cookies[0].split(';')[0];

    // -------------------------------------------------------------
    // Test 6: Session Persistence (Accessing Protected Route)
    // -------------------------------------------------------------
    console.log('▶ Test 6: Session Persistence via HttpOnly Cookie...');
    const profileRes = await makeRequest('/api/auth/profile', 'GET', null, googleSessionCookie);
    assert.strictEqual(profileRes.status, 200);
    assert.strictEqual(profileRes.body.user.email, 'test.google.traveler@example.com');
    console.log('  ✅ Persistent session validated via HttpOnly cookie');

    // -------------------------------------------------------------
    // Test 7: Duplicate Account Handling (Existing Email/Password Account)
    // -------------------------------------------------------------
    console.log('▶ Test 7: Duplicate Account & Safe Provider Linking...');
    const localEmail = 'local.traveler@example.com';
    const localHashedPwd = await bcrypt.hash('SecretLocalPass123!', 10);
    const existingLocalUser = await userService.createUser({
      email: localEmail,
      password: localHashedPwd,
      full_name: 'Original Local User',
      role: 'customer'
    });
    assert(existingLocalUser, 'Local user created');

    const oauthService = require('./src/services/oauthService');
    const origVerify = oauthService.verifyGoogleToken;
    oauthService.verifyGoogleToken = async (idToken) => {
      if (idToken === 'test_existing_account_token') {
        return {
          provider: 'google',
          provider_id: 'google_sub_linked_456',
          email: localEmail,
          full_name: 'Updated Google Name',
          avatar_url: 'https://lh3.googleusercontent.com/avatar456',
          email_verified: true
        };
      }
      return origVerify.call(oauthService, idToken);
    };

    const linkRes = await makeRequest('/api/auth/oauth/google', 'POST', {
      credential: 'test_existing_account_token'
    });
    assert.strictEqual(linkRes.status, 200);
    assert.strictEqual(linkRes.body.user.email, localEmail);

    const updatedUser = await userService.findByEmail(localEmail);
    const passwordStillIntact = await bcrypt.compare('SecretLocalPass123!', updatedUser.password);
    assert.strictEqual(passwordStillIntact, true, 'Original password must remain intact after Google login');
    assert.strictEqual(updatedUser.role, 'customer', 'Role must remain customer');
    console.log('  ✅ Duplicate account safely linked: password preserved, credentials linked, permissions safe');

    oauthService.verifyGoogleToken = origVerify;

    // -------------------------------------------------------------
    // Test 8: Logout & Session Invalidation
    // -------------------------------------------------------------
    console.log('▶ Test 8: Logout & Session Invalidation...');
    const logoutRes = await makeRequest('/api/auth/logout', 'POST', null, googleSessionCookie);
    assert.strictEqual(logoutRes.status, 200);
    console.log('  ✅ Logout successful');

    const afterLogout = await makeRequest('/api/auth/profile', 'GET', null, googleSessionCookie);
    assert.strictEqual(afterLogout.status, 401, 'Logged out session must be rejected with 401 Unauthorized');
    console.log('  ✅ Invalidated session correctly rejected with 401 Unauthorized');

    // -------------------------------------------------------------
    // Test 9: Unauthorized Access with Tampered / Forged Token
    // -------------------------------------------------------------
    console.log('▶ Test 9: Unauthorized Access with Forged Token...');
    const forgedRes = await makeRequest('/api/auth/profile', 'GET', null, null, 'Bearer forged.tampered.token');
    assert.strictEqual(forgedRes.status, 401);
    console.log('  ✅ Forged / tampered token correctly rejected with 401 Unauthorized');

    console.log('\n🎉 ALL 9 GOOGLE OAUTH SECURITY & INTEGRATION TESTS PASSED!\n');
  } catch (err) {
    console.error('❌ Google OAuth Test Suite failed:', err);
    throw err;
  } finally {
    server.close();
    await require('./src/db/mongo').mongoose.disconnect();
  }
}

runGoogleOAuthTests().then(() => {
  process.exit(0);
}).catch(err => {
  process.exit(1);
});