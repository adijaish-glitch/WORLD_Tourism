const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./db/connection');
const { migrate } = require('./db/migrate');
const { authenticate, adminOnly } = require('./middleware/auth');

const authController = require('./controllers/authController');
const destinationController = require('./controllers/destinationController');
const hotelController = require('./controllers/hotelController');
const packageController = require('./controllers/packageController');
const bookingController = require('./controllers/bookingController');
const reportController = require('./controllers/reportController');
const reviewController = require('./controllers/reviewController');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: { error: 'Too many attempts, please try again later' }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth routes
app.post('/api/auth/register', authLimiter, authController.register);
app.post('/api/auth/login', authLimiter, authController.login);
app.post('/api/auth/verify-email', authController.verifyEmail);
app.post('/api/auth/resend-verification', authLimiter, authController.resendVerification);
app.post('/api/auth/forgot-password', authLimiter, authController.forgotPassword);
app.post('/api/auth/reset-password', authLimiter, authController.resetPassword);
app.post('/api/auth/social-login', authLimiter, authController.socialLogin);
app.post('/api/auth/guest-login', authLimiter, authController.guestLogin);
app.get('/api/auth/profile', authenticate, authController.getProfile);
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
app.post('/api/bookings', authenticate, bookingController.create);
app.post('/api/bookings/preview', authenticate, bookingController.preview);
app.put('/api/bookings/:id/cancel', authenticate, bookingController.cancel);

// Review routes
app.get('/api/reviews/:destId', reviewController.listByDestination);
app.post('/api/reviews', authenticate, reviewController.create);
app.delete('/api/reviews/:id', authenticate, reviewController.delete);

// Report routes (admin)
app.get('/api/reports/summary', authenticate, adminOnly, reportController.summary);
app.get('/api/reports/revenue', authenticate, adminOnly, reportController.revenue);
app.get('/api/reports/bookings-by-destination', authenticate, adminOnly, reportController.bookingsByDest);
app.get('/api/reports/occupancy', authenticate, adminOnly, reportController.occupancy);

// Start server
async function start() {
  await initDb();
  migrate();

  // Auto-seed if empty
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

  app.listen(PORT, () => {
    console.log(`🌍 TIMS Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
