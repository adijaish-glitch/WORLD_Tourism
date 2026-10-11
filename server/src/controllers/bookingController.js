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
function queryOne(sql, params = []) { return queryAll(sql, params)[0] || null; }
function run(sql, params = []) { getDb().run(sql, params); saveDb(); }

exports.list = (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { limit = 50 } = req.query;

  let sql, params;
  if (isAdmin) {
    sql = `SELECT b.*, p.name as package_name, d.name as dest_name, h.name as hotel_name,
           u.full_name as customer_name, u.email as customer_email
           FROM bookings b
           JOIN packages p ON b.package_id = p.id
           JOIN destinations d ON p.dest_id = d.id
           JOIN hotels h ON p.hotel_id = h.id
           JOIN users u ON b.user_id = u.id
           ORDER BY b.created_at DESC LIMIT ?`;
    params = [Number(limit)];
  } else {
    sql = `SELECT b.*, p.name as package_name, d.name as dest_name, h.name as hotel_name
           FROM bookings b
           JOIN packages p ON b.package_id = p.id
           JOIN destinations d ON p.dest_id = d.id
           JOIN hotels h ON p.hotel_id = h.id
           WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT ?`;
    params = [userId, Number(limit)];
  }
  const bookings = queryAll(sql, params);
  res.json({ bookings });
};

exports.create = (req, res) => {
  const { package_id, check_in, check_out, travelers, addon_ids, payment_method, notes } = req.body;
  if (!package_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'Package, check-in and check-out dates are required' });
  }

  const pkg = queryOne(`
    SELECT p.*, h.price_per_night FROM packages p
    JOIN hotels h ON p.hotel_id = h.id WHERE p.id = ?
  `, [package_id]);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });

  // Calculate pricing
  const checkIn = new Date(check_in);
  const checkOut = new Date(check_out);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  if (nights < 1) return res.status(400).json({ error: 'Invalid date range' });

  const numTravelers = Number(travelers) || 1;
  let baseTotal = pkg.base_price * nights * numTravelers;

  // Seasonal multiplier
  baseTotal *= pkg.seasonal_multiplier;

  // Group discount
  let discount = 0;
  if (numTravelers > 10) discount = 0.15;
  else if (numTravelers > 5) discount = 0.10;
  else if (numTravelers > 2) discount = 0.05;
  baseTotal *= (1 - discount);

  // Addons
  let addonTotal = 0;
  const selectedAddons = addon_ids || [];
  if (selectedAddons.length > 0) {
    const addons = queryAll(`SELECT * FROM addons WHERE id IN (${selectedAddons.map(() => '?').join(',')})`, selectedAddons);
    addonTotal = addons.reduce((sum, a) => sum + a.price, 0) * numTravelers;
  }

  const totalPrice = Math.round((baseTotal + addonTotal) * 100) / 100;

  run('INSERT INTO bookings (user_id, package_id, check_in, check_out, travelers, total_price, status, payment_method, notes, addon_ids) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [req.user.id, package_id, check_in, check_out, numTravelers, totalPrice, 'confirmed', payment_method || 'credit_card', notes || null, JSON.stringify(selectedAddons)]);

  const booking = queryOne('SELECT * FROM bookings ORDER BY id DESC LIMIT 1');
  res.status(201).json({ booking });
};

exports.cancel = (req, res) => {
  const booking = queryOne('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  if (booking.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });
  run('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['cancelled', req.params.id]);
  res.json({ message: 'Booking cancelled' });
};

// Pricing preview
exports.preview = (req, res) => {
  const { packageId, checkIn, checkOut, travelers, addonIds } = req.body;
  const pkg = queryOne(`
    SELECT p.*, h.price_per_night FROM packages p
    JOIN hotels h ON p.hotel_id = h.id WHERE p.id = ?
  `, [packageId]);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  if (nights < 1) return res.status(400).json({ error: 'Invalid date range' });

  const numTravelers = Number(travelers) || 1;
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
  const selectedAddons = addonIds || [];
  if (selectedAddons.length > 0) {
    const addons = queryAll(`SELECT * FROM addons WHERE id IN (${selectedAddons.map(() => '?').join(',')})`, selectedAddons);
    addonTotal = addons.reduce((sum, a) => sum + a.price, 0) * numTravelers;
  }

  const breakdown = [
    { label: `${basePerNight}/night × ${nights} nights × ${numTravelers} travelers`, value: basePerNight * nights * numTravelers },
  ];
  if (seasonalAmount > 0) breakdown.push({ label: `Seasonal surcharge (${((pkg.seasonal_multiplier - 1) * 100).toFixed(0)}%)`, value: seasonalAmount });
  if (discountAmount > 0) breakdown.push({ label: `Group discount (-${(discountRate * 100).toFixed(0)}%)`, value: -discountAmount });
  if (addonTotal > 0) breakdown.push({ label: `+ Add-ons`, value: addonTotal });

  const totalPrice = Math.round((subtotal + addonTotal) * 100) / 100;
  breakdown.push({ label: 'Total', value: totalPrice });

  res.json({ pricing: { breakdown, totalPrice, nights, travelers: numTravelers } });
};
