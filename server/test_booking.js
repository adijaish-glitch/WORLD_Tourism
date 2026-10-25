const assert = require('assert');
const { initDb, getDb } = require('./src/db/connection');
const { migrate } = require('./src/db/migrate');
const { connectMongo } = require('./src/db/mongo');
const bookingController = require('./src/controllers/bookingController');

// Mock request / response helpers for direct unit & integration testing
function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
  return res;
}

async function runBookingTests() {
  console.log('🧪 Starting Booking System & Business Logic Validation...\n');

  await connectMongo();
  await initDb();
  migrate();

  const db = getDb();

  // Retrieve an active tour package for testing
  const stmt = db.prepare('SELECT p.*, h.price_per_night, h.id as hotel_id FROM packages p JOIN hotels h ON p.hotel_id = h.id WHERE p.is_active = 1 LIMIT 1');
  assert(stmt.step(), 'At least one active package must exist in the database');
  const pkg = stmt.getAsObject();
  stmt.free();

  const mockUser = { id: 1, role: 'customer', email: 'traveler@test.tims', full_name: 'Test Traveler' };
  const otherUser = { id: 999, role: 'customer', email: 'other@test.tims', full_name: 'Other Traveler' };
  const adminUser = { id: 2, role: 'admin', email: 'admin@test.tims', full_name: 'System Admin' };

  // Calculate future dates (30 days from now to 35 days from now)
  const today = new Date();
  const futureIn = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const futureOut = new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // ─── 1. Test Valid Booking Creation & Price Calculation ───
  console.log('1. Testing Valid Booking Creation & Authoritative Price Calculation...');
  const reqCreate = {
    user: mockUser,
    body: {
      package_id: pkg.id,
      check_in: futureIn,
      check_out: futureOut,
      travelers: 2,
      payment_method: 'credit_card',
      notes: 'Window view please'
    }
  };
  const resCreate = createMockRes();
  bookingController.create(reqCreate, resCreate);

  assert.strictEqual(resCreate.statusCode, 201, 'Valid booking should respond with 201 Created');
  assert(resCreate.data.booking, 'Response should contain booking object');
  const createdBooking = resCreate.data.booking;
  assert(createdBooking.id, 'Booking should have an ID');
  assert(createdBooking.reference_number.startsWith('TIMS-'), 'Booking should have formatted reference number');
  assert.strictEqual(createdBooking.travelers, 2);
  assert.strictEqual(createdBooking.status, 'confirmed');
  assert.strictEqual(createdBooking.payment_status, 'paid');
  console.log(`   ✅ Booking created successfully. ID: ${createdBooking.id}, Ref: ${createdBooking.reference_number}, Total: $${createdBooking.total_price}`);

  // ─── 2. Test Invalid Date Range (check_out before check_in) ───
  console.log('2. Testing Rejection of Invalid Dates (check-out before check-in)...');
  const reqInvalidDate = {
    user: mockUser,
    body: {
      package_id: pkg.id,
      check_in: futureOut,
      check_out: futureIn, // Earlier than check-in
      travelers: 1
    }
  };
  const resInvalidDate = createMockRes();
  bookingController.create(reqInvalidDate, resInvalidDate);
  assert.strictEqual(resInvalidDate.statusCode, 400, 'Invalid date range must be rejected with 400');
  console.log('   ✅ Reversed date range correctly rejected.');

  // ─── 3. Test Past Date Rejection ───
  console.log('3. Testing Rejection of Past Check-in Dates...');
  const reqPast = {
    user: mockUser,
    body: {
      package_id: pkg.id,
      check_in: '2020-01-01',
      check_out: '2020-01-05',
      travelers: 1
    }
  };
  const resPast = createMockRes();
  bookingController.create(reqPast, resPast);
  assert.strictEqual(resPast.statusCode, 400, 'Past dates must be rejected with 400');
  console.log('   ✅ Past travel dates correctly rejected.');

  // ─── 4. Test Invalid Traveler Counts ───
  console.log('4. Testing Invalid Traveler Counts...');
  const reqZeroTravelers = {
    user: mockUser,
    body: {
      package_id: pkg.id,
      check_in: futureIn,
      check_out: futureOut,
      travelers: 0
    }
  };
  const resZero = createMockRes();
  bookingController.create(reqZeroTravelers, resZero);
  assert.strictEqual(resZero.statusCode, 400, 'Zero travelers must be rejected with 400');

  const reqExcessTravelers = {
    user: mockUser,
    body: {
      package_id: pkg.id,
      check_in: futureIn,
      check_out: futureOut,
      travelers: 9999
    }
  };
  const resExcess = createMockRes();
  bookingController.create(reqExcessTravelers, resExcess);
  assert.strictEqual(resExcess.statusCode, 400, 'Travelers exceeding maximum group size must be rejected with 400');
  console.log('   ✅ Traveler boundary limits verified.');

  // ─── 5. Test Pricing Preview Endpoint ───
  console.log('5. Testing Authoritative Price Calculation Preview...');
  const reqPreview = {
    body: {
      packageId: pkg.id,
      checkIn: futureIn,
      checkOut: futureOut,
      travelers: 4
    }
  };
  const resPreview = createMockRes();
  bookingController.preview(reqPreview, resPreview);
  assert.strictEqual(resPreview.statusCode, 200);
  assert(resPreview.data.pricing.totalPrice > 0, 'Preview must calculate total price');
  assert(resPreview.data.pricing.breakdown.length > 0, 'Preview must include itemized breakdown');
  console.log(`   ✅ Price preview verified. 4 travelers total: $${resPreview.data.pricing.totalPrice}`);

  // ─── 6. Test Authorization on Booking Detail (GET /api/bookings/:id) ───
  console.log('6. Testing Booking Access Authorization...');
  const reqGetOwn = { user: mockUser, params: { id: createdBooking.id } };
  const resGetOwn = createMockRes();
  bookingController.getById(reqGetOwn, resGetOwn);
  assert.strictEqual(resGetOwn.statusCode, 200, 'Owner must be able to view their booking');
  assert.strictEqual(resGetOwn.data.booking.reference_number, createdBooking.reference_number);

  // Unauthorized user attempt
  const reqGetUnauthorized = { user: otherUser, params: { id: createdBooking.id } };
  const resGetUnauthorized = createMockRes();
  bookingController.getById(reqGetUnauthorized, resGetUnauthorized);
  assert.strictEqual(resGetUnauthorized.statusCode, 403, 'Other user must be rejected with 403 Forbidden');
  console.log('   ✅ Booking access controls strictly enforced.');

  // ─── 7. Test Booking Cancellation ───
  console.log('7. Testing Booking Cancellation & Status Update...');
  const reqCancel = { user: mockUser, params: { id: createdBooking.id } };
  const resCancel = createMockRes();
  bookingController.cancel(reqCancel, resCancel);
  assert.strictEqual(resCancel.statusCode, 200, 'Owner can cancel their booking');
  assert.strictEqual(resCancel.data.status, 'cancelled');

  // Verify status in database
  const verifyStmt = db.prepare('SELECT status, payment_status FROM bookings WHERE id = ?');
  verifyStmt.bind([createdBooking.id]);
  verifyStmt.step();
  const updatedRow = verifyStmt.getAsObject();
  verifyStmt.free();
  assert.strictEqual(updatedRow.status, 'cancelled');
  assert.strictEqual(updatedRow.payment_status, 'refunded');

  // Attempt duplicate cancellation
  const resCancelAgain = createMockRes();
  bookingController.cancel(reqCancel, resCancelAgain);
  assert.strictEqual(resCancelAgain.statusCode, 400, 'Duplicate cancellation must be rejected with 400');
  console.log('   ✅ Cancellation and refund workflow verified.');

  console.log('\n🎉 ALL TOURISM BOOKING & AVAILABILITY TESTS PASSED!\n');
  process.exit(0);
}

runBookingTests().catch(err => {
  console.error('❌ Booking tests failed:', err);
  process.exit(1);
});
