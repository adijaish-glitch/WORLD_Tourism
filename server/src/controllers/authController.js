const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userService = require('../services/userService');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');
const oauthService = require('../services/oauthService');
const { verifyFirebaseIdToken } = require('../config/firebaseAdmin');
const { generateToken, setSessionCookie, clearSessionCookie } = require('../middleware/auth');


// In-memory rate limiting / temporary storage for unauthenticated phone OTP sessions
const phoneOtpCache = new Map(); // phone -> { otpHash, expiresAt, attempts }

// Helper to sanitize safe user object
function sanitizeUser(user) {
  if (!user) return null;
  const safe = { ...user };
  delete safe.password;
  delete safe.phone_otp_hash;
  delete safe.verification_token;
  delete safe.reset_token;
  delete safe.sessions;
  return safe;
}

// ─── 1. REGISTER (Email & Password) ───
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, username, phone, avatar_url } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Full name, email address, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const existingEmail = await userService.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    if (username) {
      const existingUsername = await userService.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
    }

    if (phone) {
      const existingPhone = await userService.findByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({ error: 'An account with this phone number already exists' });
      }
    }

    // Generate random 32-character verification token
    const verificationToken = crypto.randomBytes(16).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userService.createUser({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      full_name: full_name.trim(),
      username: username ? username.trim() : null,
      phone: phone ? phone.trim() : null,
      avatar_url: avatar_url || null,
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires: verificationExpires,
      provider: 'local'
    });

    // Send verification email via email service
    await emailService.sendVerificationEmail(email, verificationToken, full_name);

    // Issue JWT and secure HttpOnly cookie session
    const token = generateToken(user, '7d');
    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip);
    setSessionCookie(res, token, false);

    res.status(201).json({
      user: sanitizeUser(user),
      token,
      verificationToken,
      message: 'Account created successfully! Verification email has been dispatched.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
};

// ─── 2. LOGIN (Email or Username + Password) ───
exports.login = async (req, res) => {
  try {
    const { email, username, identifier, password, remember_me } = req.body;
    const loginIdentifier = identifier || email || username;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    const user = await userService.findByIdentifier(loginIdentifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact support.' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'This account was registered via social or phone login. Please sign in using that method.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const tokenDuration = remember_me ? '30d' : '24h';
    const expiresInMs = remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const token = generateToken(user, tokenDuration);

    // Track active session in MongoDB and memory
    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip, expiresInMs);

    // Set secure HttpOnly cookie
    setSessionCookie(res, token, remember_me);

    res.json({
      user: sanitizeUser(user),
      token,
      message: 'Signed in successfully'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
};

// ─── 3. PHONE NUMBER LOGIN: SEND OTP ───
exports.sendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 16) {
      return res.status(400).json({ error: 'Please enter a valid phone number (e.g., +1234567890)' });
    }

    // Rate limiting: check last send time
    const existingCache = phoneOtpCache.get(cleanPhone);
    if (existingCache && existingCache.sentAt && Date.now() - existingCache.sentAt < 30000) {
      const waitSec = Math.ceil((30000 - (Date.now() - existingCache.sentAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSec}s before requesting a new code` });
    }

    const otpResult = await smsService.sendOtp(cleanPhone);

    phoneOtpCache.set(cleanPhone, {
      otpHash: otpResult.otpHash,
      expiresAt: otpResult.expiresAt,
      attempts: 0,
      sentAt: Date.now()
    });

    res.json({
      success: true,
      message: `Verification code sent to ${cleanPhone}`,
      phone: cleanPhone,
      devCode: otpResult.devCode // Available in dev mode for testing
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
};

// ─── 4. PHONE NUMBER LOGIN: VERIFY OTP ───
exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp, full_name, remember_me } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and verification code are required' });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const cached = phoneOtpCache.get(cleanPhone);

    if (!cached) {
      return res.status(400).json({ error: 'Verification code expired or not requested. Please request a new code.' });
    }

    cached.attempts = (cached.attempts || 0) + 1;
    const verification = smsService.verifyOtp(otp, cached.otpHash, cached.expiresAt, cached.attempts);

    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    // Code verified: delete from cache
    phoneOtpCache.delete(cleanPhone);

    // Find existing user by phone or create new profile
    let user = await userService.findByPhone(cleanPhone);
    if (!user) {
      user = await userService.createUser({
        phone: cleanPhone,
        phone_verified: true,
        full_name: full_name?.trim() || `Passenger ${cleanPhone.slice(-4)}`,
        username: `user_${cleanPhone.replace(/\D/g, '').slice(-6)}`,
        provider: 'phone',
        role: 'customer'
      });
    } else {
      await userService.updateUser(user.id, { phone_verified: true });
    }

    const tokenDuration = remember_me ? '30d' : '24h';
    const expiresInMs = remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const token = generateToken(user, tokenDuration);

    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip, expiresInMs);
    setSessionCookie(res, token, remember_me);

    res.json({
      success: true,
      user: sanitizeUser(user),
      token,
      message: 'Phone verified successfully! Welcome aboard.'
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: err.message || 'OTP verification failed' });
  }
};

// ─── 4B. FIREBASE AUTHENTICATION (Phone OTP & Google via Firebase Admin) ───
exports.firebaseAuth = async (req, res) => {
  try {
    const { idToken, remember_me } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    const firebaseUser = await verifyFirebaseIdToken(idToken);
    let user = null;

    // 1. First look up user by firebase_uid
    if (firebaseUser.uid) {
      user = await userService.findByFirebaseUid(firebaseUser.uid);
    }

    // 2. Link securely by verified email if not already found by firebase_uid
    if (!user && firebaseUser.email) {
      user = await userService.findByEmail(firebaseUser.email);
      if (user) {
        await userService.updateUser(user.id, {
          firebase_uid: firebaseUser.uid,
          avatar_url: user.avatar_url || firebaseUser.avatar_url,
          email_verified: user.email_verified || firebaseUser.email_verified,
          provider_id: firebaseUser.uid
        });
        user = await userService.findById(user.id);
      }
    }

    // 3. Link securely by verified phone number if not found
    if (!user && firebaseUser.phone_number) {
      user = await userService.findByPhone(firebaseUser.phone_number);
      if (user) {
        await userService.updateUser(user.id, {
          firebase_uid: firebaseUser.uid,
          phone_verified: true,
          provider_id: firebaseUser.uid
        });
        user = await userService.findById(user.id);
      }
    }

    // 4. If new user, create profile in MongoDB
    if (!user) {
      const isPhone = firebaseUser.sign_in_provider === 'phone';
      const isGoogle = firebaseUser.sign_in_provider.includes('google');
      const provider = isPhone ? 'phone' : (isGoogle ? 'google' : 'firebase');
      
      const fallbackName = firebaseUser.full_name
        || (firebaseUser.phone_number ? `Passenger ${firebaseUser.phone_number.slice(-4)}` : 'Traveler');
      const fallbackUsername = firebaseUser.email
        ? firebaseUser.email.split('@')[0]
        : `user_${(firebaseUser.phone_number || firebaseUser.uid).replace(/\D/g, '').slice(-6)}`;

      user = await userService.createUser({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        phone: firebaseUser.phone_number || undefined,
        full_name: fallbackName,
        username: fallbackUsername,
        avatar_url: firebaseUser.avatar_url || null,
        email_verified: !!firebaseUser.email_verified,
        phone_verified: !!firebaseUser.phone_number,
        provider,
        provider_id: firebaseUser.uid,
        role: 'customer'
      });
    }

    const tokenDuration = remember_me ? '30d' : '24h';
    const expiresInMs = remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const token = generateToken(user, tokenDuration);

    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip, expiresInMs);
    setSessionCookie(res, token, remember_me);

    res.json({
      success: true,
      user: sanitizeUser(user),
      token,
      message: 'Authenticated successfully via Firebase'
    });
  } catch (err) {
    console.error('Firebase Auth error:', err);
    res.status(400).json({ error: err.message || 'Firebase authentication failed' });
  }
};


// ─── 5. GOOGLE OAUTH SIGN-IN ───
exports.oauthGoogle = async (req, res) => {
  try {
    const { credential, remember_me } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    const googlePayload = await oauthService.verifyGoogleToken(credential);
    let user = await userService.findByEmail(googlePayload.email);

    if (user) {
      // Link Google provider info
      await userService.updateUser(user.id, {
        provider: user.provider === 'local' ? 'local' : 'google',
        provider_id: googlePayload.provider_id,
        avatar_url: user.avatar_url || googlePayload.avatar_url,
        email_verified: true
      });
      user = await userService.findById(user.id);
    } else {
      user = await userService.createUser({
        email: googlePayload.email,
        full_name: googlePayload.full_name,
        avatar_url: googlePayload.avatar_url,
        email_verified: true,
        provider: 'google',
        provider_id: googlePayload.provider_id,
        role: 'customer'
      });
    }

    const tokenDuration = remember_me ? '30d' : '24h';
    const expiresInMs = remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const token = generateToken(user, tokenDuration);

    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip, expiresInMs);
    setSessionCookie(res, token, remember_me);

    res.json({
      user: sanitizeUser(user),
      token,
      message: 'Signed in with Google'
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(400).json({ error: err.message || 'Google sign-in failed' });
  }
};

// ─── 6. APPLE SIGN-IN ───
exports.oauthApple = async (req, res) => {
  try {
    const { identityToken, fullName, remember_me } = req.body;
    if (!identityToken) {
      return res.status(400).json({ error: 'Apple identity token is required' });
    }

    const applePayload = await oauthService.verifyAppleToken(identityToken, fullName);
    let user = await userService.findByProvider('apple', applePayload.provider_id);

    if (!user && applePayload.email) {
      user = await userService.findByEmail(applePayload.email);
    }

    if (user) {
      await userService.updateUser(user.id, {
        provider_id: applePayload.provider_id,
        email_verified: true
      });
      user = await userService.findById(user.id);
    } else {
      user = await userService.createUser({
        email: applePayload.email,
        full_name: applePayload.full_name,
        email_verified: true,
        provider: 'apple',
        provider_id: applePayload.provider_id,
        role: 'customer'
      });
    }

    const tokenDuration = remember_me ? '30d' : '24h';
    const expiresInMs = remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const token = generateToken(user, tokenDuration);

    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip, expiresInMs);
    setSessionCookie(res, token, remember_me);

    res.json({
      user: sanitizeUser(user),
      token,
      message: 'Signed in with Apple'
    });
  } catch (err) {
    console.error('Apple Sign-In error:', err);
    res.status(400).json({ error: err.message || 'Apple sign-in failed' });
  }
};

// ─── 7. GITHUB OAUTH SIGN-IN ───
exports.oauthGithub = async (req, res) => {
  try {
    const { code, remember_me } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'GitHub authorization code is required' });
    }

    const ghPayload = await oauthService.verifyGitHubCode(code);
    let user = await userService.findByEmail(ghPayload.email);

    if (user) {
      await userService.updateUser(user.id, {
        provider_id: ghPayload.provider_id,
        avatar_url: user.avatar_url || ghPayload.avatar_url,
        email_verified: true
      });
      user = await userService.findById(user.id);
    } else {
      user = await userService.createUser({
        email: ghPayload.email,
        full_name: ghPayload.full_name,
        username: ghPayload.username,
        avatar_url: ghPayload.avatar_url,
        email_verified: true,
        provider: 'github',
        provider_id: ghPayload.provider_id,
        role: 'customer'
      });
    }

    const tokenDuration = remember_me ? '30d' : '24h';
    const expiresInMs = remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const token = generateToken(user, tokenDuration);

    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip, expiresInMs);
    setSessionCookie(res, token, remember_me);

    res.json({
      user: sanitizeUser(user),
      token,
      message: 'Signed in with GitHub'
    });
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.status(400).json({ error: err.message || 'GitHub sign-in failed' });
  }
};

// ─── 8. SOCIAL / BACKWARD COMPATIBLE OAUTH LOGIN ───

exports.socialLogin = async (req, res) => {
  try {
    const { provider, provider_id, email, full_name, avatar_url } = req.body;

    if (!provider || !email) {
      return res.status(400).json({ error: 'Provider and email are required for social login' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await userService.findByEmail(cleanEmail);

    if (!user && provider_id) {
      user = await userService.findByProvider(provider, provider_id);
    }

    if (user) {
      await userService.updateUser(user.id, {
        provider,
        provider_id: provider_id || user.provider_id || `${provider}_${Date.now()}`,
        avatar_url: user.avatar_url || avatar_url || null,
        email_verified: true
      });
      user = await userService.findById(user.id);
    } else {
      user = await userService.createUser({
        email: cleanEmail,
        full_name: full_name || 'Traveler',
        username: (full_name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase() + '_' + Math.floor(Math.random() * 1000),
        avatar_url: avatar_url || null,
        role: 'customer',
        email_verified: true,
        provider,
        provider_id: provider_id || `${provider}_${Date.now()}`
      });
    }

    const token = generateToken(user, '30d');
    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip);
    setSessionCookie(res, token, true);

    res.json({
      user: sanitizeUser(user),
      token,
      message: `Signed in via ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
    });
  } catch (err) {
    console.error('Social login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── 8. GUEST LOGIN ───
exports.guestLogin = async (req, res) => {
  try {
    const guestNum = Math.floor(1000 + Math.random() * 9000);
    const guestEmail = `guest_${guestNum}@tims.guest`;

    const user = await userService.createUser({
      email: guestEmail,
      full_name: `Guest Traveler #${guestNum}`,
      username: `guest_${guestNum}`,
      role: 'customer',
      email_verified: true,
      provider: 'guest'
    });

    const token = generateToken(user, '1d');
    await userService.addSession(user.id, token, req.headers['user-agent'], req.ip, 24 * 3600 * 1000);
    setSessionCookie(res, token, false);

    res.json({
      user: sanitizeUser(user),
      token,
      message: 'Logged in with Guest Access'
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── 9. EMAIL VERIFICATION ───
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await userService.findByVerificationToken(token, email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    await userService.updateUser(user.id, {
      email_verified: true,
      verification_token: null,
      verification_token_expires: null
    });

    const updatedUser = await userService.findById(user.id);
    res.json({
      success: true,
      user: sanitizeUser(updatedUser),
      message: 'Email verified successfully!'
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── 10. RESEND VERIFICATION ───
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(16).toString('hex');
    await userService.updateUser(user.id, {
      verification_token: verificationToken,
      verification_token_expires: new Date(Date.now() + 24 * 3600 * 1000)
    });

    await emailService.sendVerificationEmail(email, verificationToken, user.full_name);

    res.json({
      success: true,
      verificationToken,
      message: 'A fresh verification email has been dispatched.'
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── 11. FORGOT PASSWORD ───
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const user = await userService.findByEmail(email.trim());
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been dispatched.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userService.updateUser(user.id, {
      reset_token: resetToken,
      reset_token_expires: expiresAt
    });

    const emailRes = await emailService.sendPasswordResetEmail(email, resetToken, user.full_name);

    res.json({
      success: true,
      resetToken,
      resetLink: emailRes.resetLink,
      message: 'Password reset link sent! Check your inbox or click the link below.'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── 12. RESET PASSWORD ───
exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = await userService.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or previously used reset token' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await userService.updateUser(user.id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    });

    res.json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── 13. LOGOUT & SESSION INVALIDATION ───
exports.logout = async (req, res) => {
  try {
    const token = req.token || req.cookies?.token;
    const userId = req.user?.id;

    if (token) {
      await userService.removeSession(userId, token);
    }

    clearSessionCookie(res);

    res.json({
      success: true,
      message: 'Session invalidated and logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    clearSessionCookie(res);
    res.json({ success: true, message: 'Logged out' });
  }
};

// ─── 14. PROFILE MANAGEMENT ───
exports.getProfile = async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, username, phone, avatar_url, current_password, new_password } = req.body;

    const user = await userService.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = {};

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      if (new_password.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }
      if (!user.password) {
        return res.status(400).json({ error: 'Cannot set password on external social login account' });
      }
      const valid = await bcrypt.compare(current_password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      updateData.password = await bcrypt.hash(new_password, 10);
    }

    if (full_name) updateData.full_name = full_name.trim();

    if (username) {
      const existing = await userService.findByUsername(username.trim());
      if (existing && existing.id !== user.id) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      updateData.username = username.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }

    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url || null;
    }

    const updatedUser = await userService.updateUser(userId, updateData);
    res.json({
      user: sanitizeUser(updatedUser),
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { limit = 100, skip = 0 } = req.query;
    const users = await userService.listUsers(limit, skip);
    res.json({ users: users.map(u => sanitizeUser(u)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body;
    const updateData = {};
    if (is_active !== undefined) updateData.is_active = !!is_active;
    if (role) updateData.role = role;

    const user = await userService.updateUser(id, updateData);
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
