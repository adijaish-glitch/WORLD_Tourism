const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { initDb } = require('./db/connection');
const { migrate } = require('./db/migrate');
const { connectMongo } = require('./db/mongo');
const { authenticate, adminOnly } = require('./middleware/auth');

const authController = require('./controllers/authController');
const destinationController = require('./controllers/destinationController');
const hotelController = require('./controllers/hotelController');
const packageController = require('./controllers/packageController');
const bookingController = require('./controllers/bookingController');
const reportController = require('./controllers/reportController');
const reviewController = require('./controllers/reviewController');
const countryController = require('./controllers/countryController');
const travelController = require('./controllers/travelController');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      upgradeInsecureRequests: []
    }
  }
}));

// CORS setup allowing credentials for HttpOnly cookies
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://tims-tau.vercel.app',
  'https://adijaish-glitch.github.io'
];
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('tiny'));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 auth requests per windowMs
  message: { error: 'Too many authentication attempts. Please try again in a few minutes.' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many SMS/OTP requests. Please try again later.' }
});

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  mongo_connected: require('./db/mongo').isMongoConnected()
}));

// ─── AUTHENTICATION ROUTES ───
// Email & Password Auth
app.post('/api/auth/register', authLimiter, authController.register);
app.post('/api/auth/login', authLimiter, authController.login);

// Phone Number OTP Verification via SMS
app.post('/api/auth/phone/send-otp', otpLimiter, authController.sendPhoneOtp);
app.post('/api/auth/phone/verify-otp', otpLimiter, authController.verifyPhoneOtp);

// Firebase Authentication (Phone SMS OTP & Google)
app.post('/api/auth/firebase', authLimiter, authController.firebaseAuth);

// Google, Apple & GitHub OAuth Sign-In
app.post('/api/auth/oauth/google', authLimiter, authController.oauthGoogle);
app.post('/api/auth/oauth/apple', authLimiter, authController.oauthApple);
app.post('/api/auth/oauth/github', authLimiter, authController.oauthGithub);
app.post('/api/auth/social-login', authLimiter, authController.socialLogin);

app.post('/api/auth/guest-login', authLimiter, authController.guestLogin);

// Email Verification & Password Recovery
app.post('/api/auth/verify-email', authController.verifyEmail);
app.post('/api/auth/resend-verification', authLimiter, authController.resendVerification);
app.post('/api/auth/forgot-password', authLimiter, authController.forgotPassword);
app.post('/api/auth/reset-password', authLimiter, authController.resetPassword);

// Session Logout & Invalidation
app.post('/api/auth/logout', authController.logout);

// User Profile & Persistent Session Check
app.get('/api/auth/profile', authenticate, authController.getProfile);
app.get('/api/auth/me', authenticate, authController.getProfile);
app.put('/api/auth/profile', authenticate, authController.updateProfile);

// User management (admin)
app.get('/api/users', authenticate, adminOnly, authController.listUsers);
app.put('/api/users/:id', authenticate, adminOnly, authController.updateUser);

// Destination routes
app.get('/api/destinations', destinationController.list);
app.get('/api/destinations/regions', destinationController.getRegions);
app.get('/api/destinations/:id', destinationController.getById);
app.post('/api/destinations', authenticate, adminOnly, destinationController.create);
app.put('/api/destinations/:id', authenticate, adminOnly, destinationController.update);
app.delete('/api/destinations/:id', authenticate, adminOnly, destinationController.delete);

// Country routes
app.get('/api/countries', countryController.list);
app.get('/api/countries/regions', countryController.getRegions);
app.get('/api/countries/globe', countryController.getGlobePoints);
app.get('/api/countries/:code', countryController.getByCode);

// Hotel routes
app.get('/api/hotels', hotelController.list);
app.get('/api/hotels/:id', hotelController.getById);
app.get('/api/hotels/:id/availability', hotelController.getAvailability);
app.post('/api/hotels', authenticate, adminOnly, hotelController.create);
app.put('/api/hotels/:id', authenticate, adminOnly, hotelController.update);
app.delete('/api/hotels/:id', authenticate, adminOnly, hotelController.delete);

// Package routes
app.get('/api/packages', packageController.list);
app.get('/api/packages/:id', packageController.getById);
app.post('/api/packages', authenticate, adminOnly, packageController.create);
app.put('/api/packages/:id', authenticate, adminOnly, packageController.update);
app.delete('/api/packages/:id', authenticate, adminOnly, packageController.delete);

// Booking routes
app.get('/api/bookings', authenticate, bookingController.list);
app.get('/api/bookings/:id', authenticate, bookingController.getById);
app.post('/api/bookings', authenticate, bookingController.create);
app.post('/api/bookings/preview', authenticate, bookingController.preview);
app.put('/api/bookings/:id/cancel', authenticate, bookingController.cancel);

// Review routes
app.get('/api/reviews/:destId', reviewController.listByDestination);
app.post('/api/reviews', authenticate, reviewController.create);
app.delete('/api/reviews/:id', reviewController.delete);

// Report routes (admin)
app.get('/api/reports/summary', authenticate, adminOnly, reportController.summary);
app.get('/api/reports/revenue', authenticate, adminOnly, reportController.revenue);
app.get('/api/reports/bookings-by-destination', authenticate, adminOnly, reportController.bookingsByDest);
app.get('/api/reports/occupancy', authenticate, adminOnly, reportController.occupancy);

// ─── HYBRID TRAVEL DISCOVERY & PROVIDER ROUTES ───
// Universal Search across Flights, Hotels, Trains, Buses, and Packages
app.get('/api/travel/search', travelController.search);

// Price & Availability Revalidation before checkout
app.get('/api/travel/revalidate', travelController.revalidate);

// Secure Open-Redirect Protected Outbound Gateway
app.post('/api/travel/redirect', travelController.generateRedirect);

// Authorized Travel Providers & Affiliates
app.get('/api/travel/providers', travelController.listProviders);

// Admin: Audit Logs and External Offers Management
app.get('/api/travel/audit-logs', authenticate, adminOnly, travelController.getAuditLogs);
app.post('/api/travel/offers', authenticate, adminOnly, travelController.createOffer);
app.put('/api/travel/offers/:id', authenticate, adminOnly, travelController.updateOffer);
app.delete('/api/travel/offers/:id', authenticate, adminOnly, travelController.deleteOffer);

// ─── SERVE FRONTEND CLIENT (Single Fullstack Deployment / SPA Routing) ───
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const rootDistPath = path.resolve(__dirname, '../../');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
} else if (fs.existsSync(path.join(rootDistPath, 'index.html'))) {
  app.use(express.static(rootDistPath));
}

// Fallback all non-API GET requests to SPA index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const clientIndex = path.join(clientDistPath, 'index.html');
  const rootIndex = path.join(rootDistPath, 'index.html');
  if (fs.existsSync(clientIndex)) {
    return res.sendFile(clientIndex);
  } else if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  next();
});

// Global Error Handler for secure error masking
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error. Please try again later.'
    : (err.message || 'An error occurred');
  res.status(status).json({ error: message });
});

// Start server
async function start() {
  // Validate production environment variables
  if (process.env.NODE_ENV === 'production') {
    let secret = process.env.JWT_SECRET;
    if (!secret || secret.includes('replace_with_a_strong_random_secret') || secret.includes('super_secure') || secret.length < 32) {
      process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
      console.warn('⚠️ No 32-char JWT_SECRET provided in production environment variables.');
      console.log('🔒 Auto-generated secure 256-bit ephemeral JWT_SECRET for this runtime session.');
    }
  }

  // Connect to MongoDB for user profiles & authentication
  await connectMongo();

  // Initialize SQLite database for destination, hotel, package, booking & country catalog
  await initDb();
  migrate();

  // Auto-seed destinations if empty
  const { getDb } = require('./db/connection');
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as c FROM destinations');
  stmt.step();
  const count = stmt.getAsObject().c;
  stmt.free();
  if (count === 0) {
    const { seed } = require('./seeds/seed');
    await seed();
  }

  // Auto-seed expanded global travel catalog
  const { seedGlobalTravel } = require('./seeds/seedGlobalTravel');
  await seedGlobalTravel();

  // Auto-seed countries if empty
  const cStmt = db.prepare('SELECT COUNT(*) as c FROM countries');
  cStmt.step();
  const cCount = cStmt.getAsObject().c;
  cStmt.free();
  if (cCount === 0) {
    const { seedCountries } = require('./seeds/seedCountries');
    await seedCountries();
  }

  // Auto-seed travel providers and verified partner discovery inventory
  const { seedTravelProviders } = require('./seeds/seedTravelProviders');
  await seedTravelProviders();

  const server = app.listen(PORT, () => {
    console.log(`🌍 TIMS Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
  return server;
}

if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
module.exports.start = start;
