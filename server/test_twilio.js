const assert = require('assert');
const smsService = require('./src/services/smsService');

async function runTwilioTests() {
  console.log('🧪 Starting Twilio SMS Service & Security Validation...\n');

  // Test 1: Configuration check
  const configured = smsService.isConfigured();
  console.log(`1. Twilio Configuration Status: ${configured ? 'Configured (Live API active)' : 'Dev Simulator active'}`);
  assert.strictEqual(typeof configured, 'boolean');

  // Test 2: Phone number normalization and OTP generation
  const phone = '+1 (555) 234-5678';
  const otpResult = await smsService.sendOtp(phone);
  console.log('2. Testing OTP Dispatch:');
  console.log(`   Phone Normalized: ${otpResult.phone}`);
  assert.strictEqual(otpResult.phone, '+15552345678');
  assert.ok(otpResult.otpHash && otpResult.otpHash.length === 64, 'SHA-256 hash generated');
  assert.ok(otpResult.expiresAt > new Date(), 'Expiry set in the future');

  // Test 3: OTP Verification
  const validOtp = otpResult.devCode;
  if (validOtp) {
    const verification = smsService.verifyOtp(validOtp, otpResult.otpHash, otpResult.expiresAt);
    console.log('3. Testing OTP Verification:');
    assert.strictEqual(verification.valid, true, 'Valid OTP accepted');

    const invalidVerification = smsService.verifyOtp('000000', otpResult.otpHash, otpResult.expiresAt);
    assert.strictEqual(invalidVerification.valid, false, 'Invalid OTP rejected');

    const lockoutVerification = smsService.verifyOtp(validOtp, otpResult.otpHash, otpResult.expiresAt, 4);
    assert.strictEqual(lockoutVerification.valid, false, 'Rate limited lockout enforced');

    const expiredVerification = smsService.verifyOtp(validOtp, otpResult.otpHash, new Date(Date.now() - 1000));
    assert.strictEqual(expiredVerification.valid, false, 'Expired OTP rejected');
    console.log('   ✅ All OTP cryptographic, expiry, and brute-force defenses verified');
  }

  // Test 4: Booking confirmation SMS
  console.log('4. Testing Booking Confirmation SMS Alert...');
  const bookingAlert = await smsService.sendBookingConfirmation('+15559876543', {
    referenceNumber: 'TIMS-2026-TEST01',
    destination: 'Paris, France',
    checkIn: '2026-12-01',
    travelers: 2,
    total: 1850
  });
  assert.strictEqual(bookingAlert.success, true);
  console.log('   ✅ Booking confirmation SMS dispatched successfully');

  // Test 5: Security Alert SMS
  console.log('5. Testing Security Alert SMS Notice...');
  const securityAlert = await smsService.sendSecurityAlert('+15559876543', 'Password changed from Web Client');
  assert.strictEqual(securityAlert.success, true);
  console.log('   ✅ Security Alert SMS dispatched successfully');

  console.log('\n🎉 ALL TWILIO & SMS SERVICE CHECKS PASSED SUCCESSFULLY!\n');
}

runTwilioTests().catch(err => {
  console.error('❌ Twilio test failed:', err);
  process.exit(1);
});

