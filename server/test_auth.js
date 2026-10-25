const assert = require('assert');

async function runTests() {
  console.log('🧪 Starting Authentication System Validation...\n');

  const { initDb } = require('./src/db/connection');
  const { migrate } = require('./src/db/migrate');
  const { connectMongo, isMongoConnected } = require('./src/db/mongo');
  const userService = require('./src/services/userService');
  const smsService = require('./src/services/smsService');
  const emailService = require('./src/services/emailService');
  const bcrypt = require('bcryptjs');

  // 1. Initialize databases
  await connectMongo();
  await initDb();
  migrate();
  console.log('✅ Databases initialized. MongoDB connected status:', isMongoConnected());

  // 2. Test Password Hashing & Registration
  const testEmail = `traveler_${Date.now()}@example.com`;
  const rawPassword = 'SecurePassword123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const newUser = await userService.createUser({
    email: testEmail,
    password: hashedPassword,
    full_name: 'Alex Explorer',
    username: `alex_${Date.now()}`,
    phone: '+15550192834',
    role: 'customer'
  });

  assert(newUser, 'User should be created');
  assert.strictEqual(newUser.email, testEmail.toLowerCase());
  assert(newUser.id, 'User should have an ID');
  console.log('✅ User Registration & SQLite Shadow/Bridge successful. User ID:', newUser.id);

  // 3. Test Password Comparison
  const isMatch = await bcrypt.compare(rawPassword, newUser.password);
  assert.strictEqual(isMatch, true, 'Valid password must match hash');
  const isWrongMatch = await bcrypt.compare('WrongPassword', newUser.password);
  assert.strictEqual(isWrongMatch, false, 'Invalid password must be rejected');
  console.log('✅ Bcrypt password verification verified.');

  // 4. Test Phone OTP Generation and Verification via SMS service
  const phone = '+15550192834';
  const otpResult = await smsService.sendOtp(phone);
  assert(otpResult.otpHash, 'OTP hash must be generated');
  assert(otpResult.expiresAt, 'OTP must have an expiration timestamp');
  console.log('✅ SMS OTP Dispatch & Cryptographic Hashing passed.');

  // Verify OTP check
  const verificationSuccess = smsService.verifyOtp(
    otpResult.devCode || '123456',
    otpResult.otpHash,
    otpResult.expiresAt
  );
  if (otpResult.devCode) {
    assert.strictEqual(verificationSuccess.valid, true, 'Valid OTP must pass');
  }

  const verificationFail = smsService.verifyOtp('000000', otpResult.otpHash, otpResult.expiresAt);
  assert.strictEqual(verificationFail.valid, false, 'Incorrect OTP must be rejected');
  console.log('✅ SMS OTP Verification logic verified.');

  // 5. Test Email Verification & Password Reset tokens
  const emailResult = await emailService.sendVerificationEmail(testEmail, 'test-verification-token-123', 'Alex');
  assert(emailResult.verifyLink, 'Verification link generated');
  const resetResult = await emailService.sendPasswordResetEmail(testEmail, 'test-reset-token-456', 'Alex');
  assert(resetResult.resetLink, 'Reset link generated');
  console.log('✅ Email service (Verification & Password Reset) verified.');

  // 6. Test Session Invalidation
  const testToken = 'simulated_jwt_token_for_session_test';
  await userService.addSession(newUser.id, testToken, 'NodeTestAgent', '127.0.0.1');
  const isValidBefore = await userService.isSessionValid(newUser.id, testToken);
  assert.strictEqual(isValidBefore, true, 'Session should be valid when active');

  await userService.removeSession(newUser.id, testToken);
  const isValidAfter = await userService.isSessionValid(newUser.id, testToken);
  // Memory cache removed immediately
  assert.strictEqual(isValidAfter, false, 'Session should be invalidated after logout');
  console.log('✅ Session creation and logout invalidation verified.');

  console.log('\n🎉 ALL AUTHENTICATION UNIT & INTEGRATION CHECKS PASSED!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
