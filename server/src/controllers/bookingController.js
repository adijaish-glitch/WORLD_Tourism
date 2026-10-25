const crypto = require('crypto');
const { getDb, saveDb } = require('../db/connection');

function queryAll(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  return queryAll(sql, params)[0] || null;
}

function run(sql, params = []) {
  getDb().run(sql, params);
  saveDb();
}

/**
 * Validate ISO date string and parse to UTC midnight timestamp
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Calculate authoritative pricing breakdown
 */
function calculatePricing(pkg, nights, numTravelers, addonIds = []) {
  const basePerNight = pkg.base_price;
  let subtotal = basePerNight * nights * numTravelers;
  const seasonalAmount = subtotal * (pkg.seasonal_multiplier - 1);
  subtotal *= pkg.seasonal_multiplier;

  let discountRate = 0;
  if (numTravelers > 10) discountRate = 0.15;
  else if (numTravelers > 5) discountRate = 0.10;
  else if (numTravelers > 2) discountRate = 0.05;

  const discountAmount = subtotal * discountRate;
  subtotal -= discountAmount;

  let addonTotal = 0;
  let selectedAddonsList = [];
  if (addonIds && addonIds.length > 0) {
    const placeholders = addonIds.map(() => '?').join(',');
    selectedAddonsList = queryAll(`SELECT * FROM addons WHERE id IN (${placeholders})`, addonIds);
    addonTotal = selectedAddonsList.reduce((sum, a) => sum + a.price, 0) * numTravelers;
  }

  const breakdown = [
    { label: `$${basePerNight}/night × ${nights} night${nights > 1 ? 's' : ''} × ${numTravelers} traveler${numTravelers > 1 ? 's' : ''}`, value: basePerNight * nights * numTravelers }
  ];
  if (seasonalAmount > 0) {
    breakdown.push({ label: `Seasonal peak adjustment (+${((pkg.seasonal_multiplier - 1) * 100).toFixed(0)}%)`, value: seasonalAmount });
  }
  if (discountAmount > 0) {
    breakdown.push({ label: `Group discount (-${(discountRate * 100).toFixed(0)}%)`, value: -discountAmount });
  }
  if (addonTotal > 0) {
    breakdown.push({ label: `Add-ons (${selectedAddonsList.map(a => a.name).join(', ')})`, value: addonTotal });
  }

  const totalPrice = Math.round((subtotal + addonTotal) * 100) / 100;
  breakdown.push({ label: 'Total Amount', value: totalPrice });

  return { totalPrice, breakdown, addonTotal, selectedAddonsList };
}

// ─── 1. LIST BOOKINGS ───
exports.list = (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { limit = 50 } = req.query;

  let sql, params;
  if (isAdmin) {
    sql = `SELECT b.*, p.name as package_name, d.name as dest_name, d.country as dest_country, h.name as hotel_name,
           u.full_name as customer_name, u.email as customer_email
           FROM bookings b
           JOIN packages p ON b.package_id = p.id
           JOIN destinations d ON p.dest_id = d.id
           JOIN hotels h ON p.hotel_id = h.id
           JOIN users u ON b.user_id = u.id
           ORDER BY b.created_at DESC LIMIT ?`;
    params = [Number(limit)];
  } else {
    sql = `SELECT b.*, p.name as package_name, d.name as dest_name, d.country as dest_country, h.name as hotel_name
           FROM bookings b
           JOIN packages p ON b.package_id = p.id
           JOIN destinations d ON p.dest_id = d.id
           JOIN hotels h ON p.hotel_id = h.id
           WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT ?`;
    params = [userId, Number(limit)];
  }

  const bookings = queryAll(sql, params).map(b => ({
    ...b,
    reference_number: b.reference_number || `TIMS-${String(b.id).padStart(5, '0')}`,
    addon_ids: typeof b.addon_ids === 'string' ? JSON.parse(b.addon_ids || '[]') : (b.addon_ids || [])
  }));

  res.json({ bookings });
};

// ─── 2. GET BOOKING BY ID ───
exports.getById = (req, res) => {
  const { id } = req.params;
  const booking = queryOne(`
    SELECT b.*, p.name as package_name, p.base_price, p.seasonal_multiplier,
           d.name as dest_name, d.country as dest_country, d.image_url as dest_image,
           h.name as hotel_name, h.category as hotel_category,
           u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    JOIN destinations d ON p.dest_id = d.id
    JOIN hotels h ON p.hotel_id = h.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `, [id]);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to view this booking' });
  }

  const addonIds = typeof booking.addon_ids === 'string'
    ? JSON.parse(booking.addon_ids || '[]')
    : (booking.addon_ids || []);

  let addons = [];
  if (addonIds.length > 0) {
    const placeholders = addonIds.map(() => '?').join(',');
    addons = queryAll(`SELECT * FROM addons WHERE id IN (${placeholders})`, addonIds);
  }

  booking.reference_number = booking.reference_number || `TIMS-${String(booking.id).padStart(5, '0')}`;
  booking.addons = addons;

  res.json({ booking });
};

// ─── 3. CREATE BOOKING ───
exports.create = (req, res) => {
  const { package_id, check_in, check_out, travelers, addon_ids, payment_method, notes } = req.body;

  if (!package_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'Package ID, check-in date, and check-out date are required' });
  }

  const checkInDate = parseDate(check_in);
  const checkOutDate = parseDate(check_out);

  if (!checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
  }

  // Verify check_in is not in the past (allow today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkInDate < today) {
    return res.status(400).json({ error: 'Check-in date cannot be in the past' });
  }

  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    return res.status(400).json({ error: 'Check-out date must be after check-in date' });
  }
  if (nights > 90) {
    return res.status(400).json({ error: 'Bookings cannot exceed 90 nights' });
  }

  const numTravelers = parseInt(travelers, 10);
  if (isNaN(numTravelers) || numTravelers < 1) {
    return res.status(400).json({ error: 'Number of travelers must be at least 1' });
  }

  // Verify package exists and is active
  const pkg = queryOne(`
    SELECT p.*, h.price_per_night, h.total_rooms, h.id as hotel_id
    FROM packages p
    JOIN hotels h ON p.hotel_id = h.id
    WHERE p.id = ? AND p.is_active = 1
  `, [package_id]);

  if (!pkg) {
    return res.status(404).json({ error: 'Tour package not found or currently unavailable' });
  }

  if (numTravelers > (pkg.max_group_size || 20)) {
    return res.status(400).json({
      error: `Group size exceeds maximum package capacity of ${pkg.max_group_size || 20} travelers`
    });
  }

  // Authoritative availability check on hotel rooms
  const overlapping = queryOne(`
    SELECT COALESCE(SUM(b.travelers), 0) as current_booked_travelers
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE p.hotel_id = ?
      AND b.status != 'cancelled'
      AND (b.check_in < ? AND b.check_out > ?)
  `, [pkg.hotel_id, check_out, check_in]);

  const totalRooms = pkg.total_rooms || 50;
  const currentOccupancy = overlapping ? overlapping.current_booked_travelers : 0;
  // Assume each room accommodates up to 2 guests
  if (currentOccupancy + numTravelers > totalRooms * 2) {
    return res.status(400).json({
      error: 'Selected accommodation has reached full capacity for these dates. Please choose alternative dates.'
    });
  }

  // Calculate authoritative pricing
  const cleanAddonIds = Array.isArray(addon_ids) ? addon_ids.map(Number).filter(Boolean) : [];
  const { totalPrice } = calculatePricing(pkg, nights, numTravelers, cleanAddonIds);

  // Generate unique booking reference number
  const refCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  const referenceNumber = `TIMS-${new Date().getFullYear()}-${refCode}`;

  run(
    `INSERT INTO bookings (user_id, package_id, check_in, check_out, travelers, total_price, status, payment_method, notes, addon_ids, reference_number, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      package_id,
      check_in,
      check_out,
      numTravelers,
      totalPrice,
      'confirmed',
      payment_method || 'credit_card',
      notes ? notes.trim() : null,
      JSON.stringify(cleanAddonIds),
      referenceNumber,
      'paid'
    ]
  );

  const booking = queryOne(`
    SELECT b.*, p.name as package_name, d.name as dest_name, d.country as dest_country, h.name as hotel_name
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    JOIN destinations d ON p.dest_id = d.id
    JOIN hotels h ON p.hotel_id = h.id
    WHERE b.reference_number = ?
    ORDER BY b.id DESC LIMIT 1
  `, [referenceNumber]);

  res.status(201).json({
    booking,
    message: 'Booking confirmed successfully'
  });
};

// ─── 4. CANCEL BOOKING ───
exports.cancel = (req, res) => {
  const { id } = req.params;
  const booking = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to cancel this booking' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'This booking is already cancelled' });
  }

  run(
    "UPDATE bookings SET status = 'cancelled', payment_status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );

  res.json({
    message: 'Booking cancelled successfully. Any eligible payments have been scheduled for refund.',
    booking_id: Number(id),
    status: 'cancelled'
  });
};

// ─── 5. PRICING PREVIEW ───
exports.preview = (req, res) => {
  const { packageId, checkIn, checkOut, travelers, addonIds } = req.body;

  if (!packageId || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'packageId, checkIn, and checkOut are required' });
  }

  const pkg = queryOne(`
    SELECT p.*, h.price_per_night, h.total_rooms, h.id as hotel_id
    FROM packages p
    JOIN hotels h ON p.hotel_id = h.id
    WHERE p.id = ? AND p.is_active = 1
  `, [packageId]);

  if (!pkg) return res.status(404).json({ error: 'Package not found or inactive' });

  const checkInDate = parseDate(checkIn);
  const checkOutDate = parseDate(checkOut);

  if (!checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    return res.status(400).json({ error: 'Check-out date must be after check-in date' });
  }

  const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);
  const cleanAddonIds = Array.isArray(addonIds) ? addonIds.map(Number).filter(Boolean) : [];

  const { totalPrice, breakdown } = calculatePricing(pkg, nights, numTravelers, cleanAddonIds);

  res.json({
    pricing: {
      breakdown,
      totalPrice,
      nights,
      travelers: numTravelers
    }
  });
};
