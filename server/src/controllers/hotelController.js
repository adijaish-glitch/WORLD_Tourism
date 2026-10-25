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
  const { dest_id, category, limit = 100 } = req.query;
  let where = [], params = [];
  if (dest_id) { where.push('h.dest_id = ?'); params.push(Number(dest_id)); }
  if (category) { where.push('h.category = ?'); params.push(category); }
  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const hotels = queryAll(`
    SELECT h.*, d.name as dest_name FROM hotels h
    JOIN destinations d ON h.dest_id = d.id ${whereClause}
    ORDER BY h.rating DESC LIMIT ?
  `, [...params, Number(limit)]);
  res.json({ hotels });
};

exports.getById = (req, res) => {
  const hotel = queryOne(`
    SELECT h.*, d.name as dest_name FROM hotels h
    JOIN destinations d ON h.dest_id = d.id WHERE h.id = ?
  `, [req.params.id]);
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
  res.json({ hotel });
};

exports.getAvailability = (req, res) => {
  const hotel = queryOne('SELECT total_rooms FROM hotels WHERE id = ?', [req.params.id]);
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  // Query authoritative active bookings for this hotel that are current or upcoming
  const bookings = queryAll(`
    SELECT b.check_in, b.check_out, SUM(b.travelers) as booked_guests
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE p.hotel_id = ? AND b.status != 'cancelled' AND b.check_out >= date('now')
    GROUP BY b.check_in, b.check_out
  `, [req.params.id]);

  const maxCapacity = (hotel.total_rooms || 50) * 2;
  const fullyBookedDates = [];
  bookings.forEach(b => {
    if (b.booked_guests >= maxCapacity) {
      fullyBookedDates.push(b.check_in);
    }
  });

  res.json({
    total_rooms: hotel.total_rooms || 50,
    fully_booked_dates: fullyBookedDates,
    active_reservations: bookings.length
  });
};

exports.create = (req, res) => {
  const { name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description } = req.body;
  run('INSERT INTO hotels (name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, dest_id, category || 'standard', price_per_night, rating || 0, total_rooms || 50, amenities, image_url, description]);
  const hotel = queryOne('SELECT * FROM hotels ORDER BY id DESC LIMIT 1');
  res.status(201).json({ hotel });
};

exports.update = (req, res) => {
  const { name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description } = req.body;
  run('UPDATE hotels SET name=?, dest_id=?, category=?, price_per_night=?, rating=?, total_rooms=?, amenities=?, image_url=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description, req.params.id]);
  const hotel = queryOne('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
  res.json({ hotel });
};

exports.delete = (req, res) => {
  run('DELETE FROM hotels WHERE id = ?', [req.params.id]);
  res.json({ message: 'Hotel deleted' });
};
