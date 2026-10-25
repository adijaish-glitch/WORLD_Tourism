const { getDb } = require('../db/connection');

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

exports.summary = (req, res) => {
  const stats = {
    total_countries: queryOne('SELECT COUNT(*) as c FROM countries')?.c || 0,
    total_destinations: queryOne('SELECT COUNT(*) as c FROM destinations')?.c || 0,
    total_hotels: queryOne('SELECT COUNT(*) as c FROM hotels')?.c || 0,
    total_packages: queryOne('SELECT COUNT(*) as c FROM packages WHERE is_active = 1')?.c || 0,
    total_bookings: queryOne('SELECT COUNT(*) as c FROM bookings')?.c || 0,
    total_revenue: queryOne("SELECT COALESCE(SUM(total_price), 0) as s FROM bookings WHERE status != 'cancelled'")?.s || 0,
    total_users: queryOne('SELECT COUNT(*) as c FROM users')?.c || 0,
    active_bookings: queryOne("SELECT COUNT(*) as c FROM bookings WHERE status = 'confirmed'")?.c || 0,
  };
  res.json({ stats });
};

exports.revenue = (req, res) => {
  const data = queryAll(`
    SELECT strftime('%Y-%m', created_at) as month,
           SUM(total_price) as revenue,
           COUNT(*) as bookings
    FROM bookings WHERE status != 'cancelled'
    GROUP BY month ORDER BY month DESC LIMIT 12
  `);
  res.json({ data: data.reverse() });
};

exports.bookingsByDest = (req, res) => {
  const data = queryAll(`
    SELECT d.name as destination, COUNT(b.id) as booking_count
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    JOIN destinations d ON p.dest_id = d.id
    WHERE b.status != 'cancelled'
    GROUP BY d.id ORDER BY booking_count DESC LIMIT 10
  `);
  res.json({ data });
};

exports.occupancy = (req, res) => {
  const data = queryAll(`
    SELECT h.name as hotel_name, h.total_rooms,
           COUNT(b.id) as booking_count,
           COALESCE(SUM(b.travelers), 0) as active_guests,
           ROUND(
             MIN(
               100.0,
               CAST(COALESCE(SUM(b.travelers), 0) AS FLOAT) / MAX(h.total_rooms * 2, 1) * 100
             ),
             1
           ) as occupancy_rate
    FROM hotels h
    LEFT JOIN packages p ON p.hotel_id = h.id
    LEFT JOIN bookings b ON b.package_id = p.id
      AND b.status != 'cancelled'
      AND (
        (date('now') BETWEEN date(b.check_in) AND date(b.check_out))
        OR (date(b.check_in) >= date('now') AND date(b.check_in) <= date('now', '+30 days'))
      )
    GROUP BY h.id ORDER BY occupancy_rate DESC
  `);
  res.json({ data });
};
