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
 * Format phone number into clean E.164-compatible string
 */
function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).trim().replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    // If no leading plus, default to +1 if 10 digits or prepend +
    cleaned = cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}`;
  }
  return cleaned;
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
          try {
            resolve(JSON.parse(responseBody));
          } catch {
            resolve({ status: 'delivered', raw: responseBody });
          }
        } else {
          console.warn(`Twilio API response ${res.statusCode}:`, responseBody);
          reject(new Error(`Twilio returned status ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (err) => {
      console.warn('Twilio request network error:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

class SmsService {
  /**
   * Check if Twilio environment variables are configured
   */
  isConfigured() {
    return !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER &&
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
    );
  }

  /**
   * General purpose SMS sender (Twilio when configured, safe console simulator in dev)
   */
  async sendSms(to, body) {
    const cleanPhone = cleanPhoneNumber(to);
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error('Valid phone number with country code is required (e.g. +1234567890)');
    }

    let deliveredViaTwilio = false;
    let messageSid = null;
    let error = null;

    if (this.isConfigured()) {
      try {
        const result = await sendViaTwilio(cleanPhone, body);
        deliveredViaTwilio = true;
        messageSid = result?.sid || 'delivered';
        console.log(`📱 [Twilio SMS Delivered] To: ${cleanPhone} | SID: ${messageSid}`);
      } catch (err) {
        error = err.message;
        console.warn(`⚠️ [Twilio SMS Warning] Delivery failed to ${cleanPhone}: ${err.message}. Using safe fallback.`);
      }
    }

    // Dev Simulator logging when Twilio is not configured or fails
    if (!deliveredViaTwilio) {
      console.log('==================================================');
      console.log(`📱 [SMS SERVICE DEV SIMULATOR - TWILIO ${this.isConfigured() ? 'FALLBACK' : 'PENDING CONFIG'}]`);
      console.log(`To:      ${cleanPhone}`);
      console.log(`From:    ${process.env.TWILIO_PHONE_NUMBER || '+1555000TIMS (Dev Simulator)'}`);
      console.log(`Message: ${body}`);
      console.log('==================================================');
    }

    return {
      success: true,
      deliveredViaTwilio,
      messageSid,
      to: cleanPhone,
      error
    };
  }

  /**
   * Send 6-digit OTP for phone authentication or phone number verification
   */
  async sendOtp(phone) {
    const cleanPhone = cleanPhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error('Invalid phone number format');
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const message = `[TIMS Tourism] Your verification security code is: ${otp}. Valid for 5 minutes. Never share this code with anyone.`;

    const smsResult = await this.sendSms(cleanPhone, message);

    return {
      phone: cleanPhone,
      otpHash,
      expiresAt,
      deliveredViaTwilio: smsResult.deliveredViaTwilio,
      // Provide devCode in development/testing mode when Twilio is not configured
      devCode: (!smsResult.deliveredViaTwilio && process.env.NODE_ENV !== 'production') ? otp : undefined
    };
  }

  /**
   * Verify an entered OTP against stored hash, expiry, and attempt limits
   */
  verifyOtp(enteredOtp, storedHash, expiresAt, attempts = 0) {
    if (attempts >= 4) {
      return { valid: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
    }

    if (!expiresAt || new Date() > new Date(expiresAt)) {
      return { valid: false, error: 'Verification code has expired. Please request a new code.' };
    }

    const calculatedHash = hashOtp(String(enteredOtp).trim());
    if (calculatedHash !== storedHash) {
      return { valid: false, error: 'Invalid verification code. Please check and try again.' };
    }

    return { valid: true };
  }

  /**
   * Send Booking Confirmation Notification via SMS
   */
  async sendBookingConfirmation(phone, { referenceNumber, destination, checkIn, travelers, total }) {
    if (!phone) return null;
    const body = `[TIMS Booking Confirmed] Ref #${referenceNumber} for ${destination}. Check-in: ${checkIn}. Travelers: ${travelers}. Total: $${total}. Manage your trip in Traveler Dashboard: https://tims-tourism.onrender.com/dashboard`;
    return this.sendSms(phone, body);
  }

  /**
   * Send Security Alert via SMS (e.g., password change or email update)
   */
  async sendSecurityAlert(phone, actionDescription) {
    if (!phone) return null;
    const body = `[TIMS Security Notice] Your account experienced: ${actionDescription}. If this was not you, please secure your account immediately: https://tims-tourism.onrender.com/profile`;
    return this.sendSms(phone, body);
  }
}

module.exports = new SmsService();
