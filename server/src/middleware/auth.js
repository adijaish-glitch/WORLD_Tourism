const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'tims_secret_key_2024_super_secure';

// Helper to set secure HttpOnly cookie
function setSessionCookie(res, token, rememberMe = false) {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000;     // 24 hours

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge,
    path: '/'
  });
}

// Helper to clear session cookie on logout
function clearSessionCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
}

// Authentication middleware checking HttpOnly cookie and/or Bearer header
async function authenticate(req, res, next) {
  let token = null;

  // 1. Prioritize secure HttpOnly cookie
  if (req.cookies && (req.cookies.token || req.cookies.tims_session)) {
    token = req.cookies.token || req.cookies.tims_session;
  }
  // 2. Fall back to Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify session has not been revoked/invalidated via logout
    const isValidSession = await userService.isSessionValid(decoded.id, token);
    if (!isValidSession) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Session expired or invalidated. Please sign in again.' });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

// Admin only middleware
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Generate JWT token
function generateToken(user, expiresIn = '7d') {
  return jwt.sign(
    {
      id: user.id || user.sqlite_id,
      email: user.email,
      role: user.role || 'customer',
      full_name: user.full_name,
      username: user.username,
      phone: user.phone
    },
    JWT_SECRET,
    { expiresIn }
  );
}

module.exports = {
  authenticate,
  adminOnly,
  generateToken,
  setSessionCookie,
  clearSessionCookie,
  JWT_SECRET
};
