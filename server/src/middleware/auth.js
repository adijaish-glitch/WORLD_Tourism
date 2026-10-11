const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tims_secret_key_2024_super_secure';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function generateToken(user, expiresIn = '7d') {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name, username: user.username },
    JWT_SECRET,
    { expiresIn }
  );
}

module.exports = { authenticate, adminOnly, generateToken, JWT_SECRET };
