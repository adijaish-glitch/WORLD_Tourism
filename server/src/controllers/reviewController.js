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

exports.listByDestination = (req, res) => {
  const reviews = queryAll(
    'SELECT * FROM reviews WHERE dest_id = ? ORDER BY created_at DESC',
    [req.params.destId]
  );
  res.json({ reviews });
};

exports.create = (req, res) => {
  const { dest_id, rating, comment } = req.body;

  if (!dest_id || !rating) {
    return res.status(400).json({ error: 'Destination and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // Check destination exists
  const dest = queryOne('SELECT id FROM destinations WHERE id = ?', [dest_id]);
  if (!dest) return res.status(404).json({ error: 'Destination not found' });

  // Check if user already reviewed this destination
  const existing = queryOne(
    'SELECT id FROM reviews WHERE dest_id = ? AND user_id = ?',
    [dest_id, req.user.id]
  );
  if (existing) {
    return res.status(409).json({ error: 'You have already reviewed this destination' });
  }

  run(
    'INSERT INTO reviews (dest_id, user_id, reviewer_name, rating, comment) VALUES (?,?,?,?,?)',
    [dest_id, req.user.id, req.user.full_name, Number(rating), comment || null]
  );

  // Recalculate destination average rating
  const avg = queryOne(
    'SELECT AVG(rating) as avg_rating FROM reviews WHERE dest_id = ?',
    [dest_id]
  );
  if (avg && avg.avg_rating) {
    run('UPDATE destinations SET rating = ? WHERE id = ?', [
      Math.round(avg.avg_rating * 10) / 10,
      dest_id
    ]);
  }

  const review = queryOne('SELECT * FROM reviews ORDER BY id DESC LIMIT 1');
  res.status(201).json({ review });
};

exports.delete = (req, res) => {
  const review = queryOne('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  // Only allow the review author or admin to delete
  if (review.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const destId = review.dest_id;
  run('DELETE FROM reviews WHERE id = ?', [req.params.id]);

  // Recalculate destination average rating
  const avg = queryOne(
    'SELECT AVG(rating) as avg_rating FROM reviews WHERE dest_id = ?',
    [destId]
  );
  run('UPDATE destinations SET rating = ? WHERE id = ?', [
    avg?.avg_rating ? Math.round(avg.avg_rating * 10) / 10 : 0,
    destId
  ]);

  res.json({ message: 'Review deleted' });
};
