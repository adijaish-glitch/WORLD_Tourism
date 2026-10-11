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
  const { search, region, min_rating, page = 1, limit = 12 } = req.query;
  let where = [], params = [];
  if (search) { where.push("(d.name LIKE ? OR d.country LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
  if (region) { where.push("d.region = ?"); params.push(region); }
  if (min_rating) { where.push("d.rating >= ?"); params.push(Number(min_rating)); }
  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = queryOne(`SELECT COUNT(*) as count FROM destinations d ${whereClause}`, params)?.count || 0;
  const offset = (Number(page) - 1) * Number(limit);
  const destinations = queryAll(
    `SELECT d.* FROM destinations d ${whereClause} ORDER BY d.rating DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );
  res.json({ destinations, total, page: Number(page), limit: Number(limit) });
};

exports.getById = (req, res) => {
  const dest = queryOne('SELECT * FROM destinations WHERE id = ?', [req.params.id]);
  if (!dest) return res.status(404).json({ error: 'Destination not found' });
  const hotels = queryAll('SELECT * FROM hotels WHERE dest_id = ?', [dest.id]);
  const packages = queryAll(`
    SELECT p.*, h.name as hotel_name, h.category as hotel_category
    FROM packages p JOIN hotels h ON p.hotel_id = h.id WHERE p.dest_id = ?
  `, [dest.id]);
  // Attach addons to packages
  packages.forEach(p => {
    p.addons = queryAll('SELECT * FROM addons WHERE package_id = ?', [p.id]);
  });
  const reviews = queryAll('SELECT * FROM reviews WHERE dest_id = ? ORDER BY created_at DESC', [dest.id]);
  res.json({ destination: dest, hotels, packages, reviews });
};

exports.getRegions = (req, res) => {
  const rows = queryAll('SELECT DISTINCT region FROM destinations ORDER BY region');
  res.json({ regions: rows.map(r => r.region) });
};

exports.create = (req, res) => {
  const { name, country, region, description, latitude, longitude, image_url, rating, best_season } = req.body;
  run('INSERT INTO destinations (name, country, region, description, latitude, longitude, image_url, rating, best_season) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, country, region, description, latitude, longitude, image_url, rating || 0, best_season]);
  const dest = queryOne('SELECT * FROM destinations ORDER BY id DESC LIMIT 1');
  res.status(201).json({ destination: dest });
};

exports.update = (req, res) => {
  const { name, country, region, description, latitude, longitude, image_url, rating, best_season } = req.body;
  run('UPDATE destinations SET name=?, country=?, region=?, description=?, latitude=?, longitude=?, image_url=?, rating=?, best_season=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [name, country, region, description, latitude, longitude, image_url, rating, best_season, req.params.id]);
  const dest = queryOne('SELECT * FROM destinations WHERE id = ?', [req.params.id]);
  res.json({ destination: dest });
};

exports.delete = (req, res) => {
  run('DELETE FROM destinations WHERE id = ?', [req.params.id]);
  res.json({ message: 'Destination deleted' });
};
