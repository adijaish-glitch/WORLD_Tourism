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
  let packages = queryAll(`
    SELECT p.*, d.name as dest_name, d.country as dest_country, h.name as hotel_name, h.category as hotel_category
    FROM packages p
    JOIN destinations d ON p.dest_id = d.id
    JOIN hotels h ON p.hotel_id = h.id
    ${whereClause} ORDER BY p.base_price ASC LIMIT ?
  `, [...params, Number(limit)]);

  // On-the-fly dynamic package generator for any unseeded searched destination
  if (packages.length === 0 && search && search.trim().length >= 3 && !min_price && !max_price) {
    try {
      const db = getDb();
      const term = search.trim();
      const cleanName = term.charAt(0).toUpperCase() + term.slice(1);

      // Check if destination exists
      let dStmt = db.prepare('SELECT id, name, country FROM destinations WHERE name LIKE ?');
      dStmt.bind([`%${term}%`]);
      let dest = dStmt.step() ? dStmt.getAsObject() : null;
      dStmt.free();

      let destId = dest?.id;
      if (!destId) {
        db.run(
          'INSERT INTO destinations (name, country, region, description, latitude, longitude, image_url, rating, best_season, category) VALUES (?,?,?,?,?,?,?,?,?,?)',
          [
            cleanName,
            'India',
            'Asia',
            `Curated holiday exploration of ${cleanName} featuring iconic local sights, cultural highlights, and bespoke accommodations.`,
            25.0,
            78.0,
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
            4.8,
            'October - March',
            'Historical'
          ]
        );
        const newD = db.prepare('SELECT id FROM destinations ORDER BY id DESC LIMIT 1');
        newD.step();
        destId = newD.getAsObject().id;
        newD.free();
      }

      // Check or create hotel
      let hStmt = db.prepare('SELECT id FROM hotels WHERE dest_id = ?');
      hStmt.bind([destId]);
      let hotel = hStmt.step() ? hStmt.getAsObject() : null;
      hStmt.free();

      let hotelId = hotel?.id;
      if (!hotelId) {
        db.run(
          'INSERT INTO hotels (name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description) VALUES (?,?,?,?,?,?,?,?,?)',
          [
            `${cleanName} Grand Heritage Hotel`,
            destId,
            'luxury',
            110,
            4.7,
            50,
            'WiFi,Breakfast,AC,Room Service,Restaurant,Concierge',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            `Premier accommodations in ${cleanName} with full amenities and central location.`
          ]
        );
        const newH = db.prepare('SELECT id FROM hotels ORDER BY id DESC LIMIT 1');
        newH.step();
        hotelId = newH.getAsObject().id;
        newH.free();
      }

      // Create 2 curated packages
      db.run(
        'INSERT INTO packages (name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url) VALUES (?,?,?,?,?,?,?,?,?)',
        [
          `${cleanName} Signature Experience`,
          destId,
          hotelId,
          `The ultimate guided exploration of ${cleanName}. Private transfers, iconic sightseeing, gourmet local dining, and hand-picked excursions.`,
          240,
          4,
          8,
          1.1,
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
        ]
      );
      const p1 = db.prepare('SELECT id FROM packages ORDER BY id DESC LIMIT 1');
      p1.step();
      const pkg1Id = p1.getAsObject().id;
      p1.free();

      db.run('INSERT INTO addons (package_id, name, description, price) VALUES (?,?,?,?)',
        [pkg1Id, 'Private Airport & Station Transfer', 'Seamless executive pickup & drop-off', 45]);
      db.run('INSERT INTO addons (package_id, name, description, price) VALUES (?,?,?,?)',
        [pkg1Id, 'Guided City Sightseeing Pass', 'Skip all monument queues with private guide', 60]);

      db.run(
        'INSERT INTO packages (name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url) VALUES (?,?,?,?,?,?,?,?,?)',
        [
          `${cleanName} Highlights & Heritage Tour`,
          destId,
          hotelId,
          `An enriching 3-day holiday discovering hidden gems, scenic viewpoints, cultural masterclasses, and relaxing stays across ${cleanName}.`,
          160,
          3,
          10,
          1.0,
          'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800'
        ]
      );
      const p2 = db.prepare('SELECT id FROM packages ORDER BY id DESC LIMIT 1');
      p2.step();
      const pkg2Id = p2.getAsObject().id;
      p2.free();

      db.run('INSERT INTO addons (package_id, name, description, price) VALUES (?,?,?,?)',
        [pkg2Id, 'Gourmet Local Food Trail', 'Guided multi-course tasting session of signature dishes', 40]);

      saveDb();

      // Re-query with the new packages
      packages = queryAll(`
        SELECT p.*, d.name as dest_name, d.country as dest_country, h.name as hotel_name, h.category as hotel_category
        FROM packages p
        JOIN destinations d ON p.dest_id = d.id
        JOIN hotels h ON p.hotel_id = h.id
        ${whereClause} ORDER BY p.base_price ASC LIMIT ?
      `, [...params, Number(limit)]);
    } catch (e) {
      console.warn('[packageController] Error auto-generating package:', e.message);
    }
  }

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
