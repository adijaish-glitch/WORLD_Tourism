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
  const { dest_id, min_price, max_price, search, limit = 100 } = req.query;
  let where = ['p.is_active = 1'], params = [];
  if (dest_id) { where.push('p.dest_id = ?'); params.push(Number(dest_id)); }
  if (min_price) { where.push('p.base_price >= ?'); params.push(Number(min_price)); }
  if (max_price) { where.push('p.base_price <= ?'); params.push(Number(max_price)); }
  if (search) {
    where.push('(p.name LIKE ? OR d.name LIKE ? OR d.country LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  const whereClause = 'WHERE ' + where.join(' AND ');
  const packages = queryAll(`
    SELECT p.*, d.name as dest_name, d.country as dest_country, h.name as hotel_name, h.category as hotel_category
    FROM packages p
    JOIN destinations d ON p.dest_id = d.id
    JOIN hotels h ON p.hotel_id = h.id
    ${whereClause} ORDER BY p.base_price ASC LIMIT ?
  `, [...params, Number(limit)]);
  // Attach addons
  packages.forEach(p => {
    p.addons = queryAll('SELECT * FROM addons WHERE package_id = ?', [p.id]);
  });
  res.json({ packages });
};

exports.getById = (req, res) => {
  const pkg = queryOne(`
    SELECT p.*, d.name as dest_name, h.name as hotel_name, h.category as hotel_category, h.id as hotel_id
    FROM packages p
    JOIN destinations d ON p.dest_id = d.id
    JOIN hotels h ON p.hotel_id = h.id
    WHERE p.id = ?
  `, [req.params.id]);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });
  pkg.addons = queryAll('SELECT * FROM addons WHERE package_id = ?', [pkg.id]);
  res.json({ package: pkg });
};

exports.create = (req, res) => {
  const { name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url } = req.body;
  run('INSERT INTO packages (name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, dest_id, hotel_id, description, base_price, duration_days || 3, max_group_size || 20, seasonal_multiplier || 1.0, image_url]);
  const pkg = queryOne('SELECT * FROM packages ORDER BY id DESC LIMIT 1');
  res.status(201).json({ package: pkg });
};

exports.update = (req, res) => {
  const { name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url, is_active } = req.body;
  run('UPDATE packages SET name=?, dest_id=?, hotel_id=?, description=?, base_price=?, duration_days=?, max_group_size=?, seasonal_multiplier=?, image_url=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url, is_active !== undefined ? is_active : 1, req.params.id]);
  const pkg = queryOne('SELECT * FROM packages WHERE id = ?', [req.params.id]);
  res.json({ package: pkg });
};

exports.delete = (req, res) => {
  run('DELETE FROM packages WHERE id = ?', [req.params.id]);
  res.json({ message: 'Package deleted' });
};
