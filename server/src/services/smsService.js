const crypto = require('crypto');
const https = require('https');

// Helper to hash OTPs so they are never stored in plaintext
function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

// Generate secure 6-digit numeric OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send SMS via Twilio REST API without requiring heavy external SDK
 */
async function sendViaTwilio(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return false; // Twilio not configured, use dev delivery
  }

  const postData = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: body
  }).toString();

  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseBody));
        } else {
          console.warn(`Twilio API response ${res.statusCode}:`, responseBody);
          reject(new Error(`Twilio returned status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.warn('Twilio request error:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

class SmsService {
  /**
   * Send OTP to target phone number
   */
  async sendOtp(phone) {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const message = `[TIMS Tourism] Your single-use access code is: ${otp}. Valid for 5 minutes. Do not share this code.`;

    let deliveredViaTwilio = false;
    let deliveryError = null;

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        await sendViaTwilio(cleanPhone, message);
        deliveredViaTwilio = true;
        console.log(`📱 SMS OTP successfully sent to ${cleanPhone} via Twilio`);
      } catch (err) {
        deliveryError = err.message;
        console.warn(`⚠️ SMS dispatch failed via Twilio: ${err.message}. Falling back to dev logger.`);
      }
    }

    // Dev logger for testability when Twilio credentials are not set
    if (!deliveredViaTwilio) {
      console.log('==================================================');
      console.log(`📱 [SMS SERVICE DEV SIMULATOR]`);
      console.log(`Recipient: ${cleanPhone}`);
      console.log(`OTP Code:  ${otp}`);
      console.log(`Expires:   ${expiresAt.toLocaleTimeString()}`);
      console.log('==================================================');
    }

    return {
      phone: cleanPhone,
      otpHash,
      expiresAt,
      deliveredViaTwilio,
      // Provide devCode only in development/testing mode when Twilio is not configured
      devCode: (!deliveredViaTwilio && process.env.NODE_ENV !== 'production') ? otp : undefined
    };
  }

  /**
   * Verify an entered OTP against stored hash and expiry
   */
  verifyOtp(enteredOtp, storedHash, expiresAt, attempts = 0) {
    if (attempts >= 4) {
      return { valid: false, error: 'Too many incorrect attempts. Please request a new code.' };
    }

    if (!expiresAt || new Date() > new Date(expiresAt)) {
      return { valid: false, error: 'OTP has expired. Please request a new code.' };
    }

    const calculatedHash = hashOtp(enteredOtp.trim());
    if (calculatedHash !== storedHash) {
      return { valid: false, error: 'Invalid verification code. Please check and try again.' };
    }

    return { valid: true };
  }
}

module.exports = new SmsService();
