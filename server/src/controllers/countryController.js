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

// GET /api/countries
exports.list = (req, res) => {
  const { search, region, sort = 'name', order = 'ASC', page = 1, limit = 24 } = req.query;

  let where = [];
  let params = [];

  if (search) {
    where.push('(name LIKE ? OR capital LIKE ? OR code LIKE ? OR code3 LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (region && region !== 'all') {
    where.push('region = ?');
    params.push(region);
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  // Validate sort field
  const allowedSorts = ['name', 'population', 'area', 'capital'];
  const sortCol = allowedSorts.includes(sort) ? sort : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const total = queryOne(`SELECT COUNT(*) as count FROM countries ${whereClause}`, params)?.count || 0;
  const offset = (Number(page) - 1) * Number(limit);

  const countries = queryAll(
    `SELECT code, code3, name, official_name, capital, region, subregion, population, area,
            currencies, languages, flag_emoji, flag_url, flag_svg, latitude, longitude, best_season
     FROM countries ${whereClause} 
     ORDER BY ${sortCol} ${sortOrder} 
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  res.json({
    countries,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  });
};

// GET /api/countries/regions
exports.getRegions = (req, res) => {
  const rows = queryAll("SELECT DISTINCT region FROM countries WHERE region IS NOT NULL AND region != '' ORDER BY region");
  res.json({ regions: rows.map(r => r.region) });
};

// GET /api/countries/globe - lightweight endpoint for 3D globe pins
exports.getGlobePoints = (req, res) => {
  const countries = queryAll(`
    SELECT code, code3, name, capital, region, flag_emoji, flag_url, latitude, longitude, population
    FROM countries
    WHERE latitude != 0 AND longitude != 0
    ORDER BY name ASC
  `);
  res.json({ countries });
};

// GET /api/countries/:code
exports.getByCode = async (req, res) => {
  const queryParam = req.params.code.trim();
  
  // Try matching code (2 letters), code3 (3 letters), or name
  let country = queryOne(
    'SELECT * FROM countries WHERE LOWER(code) = LOWER(?) OR LOWER(code3) = LOWER(?) OR LOWER(name) = LOWER(?)',
    [queryParam, queryParam, queryParam]
  );

  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }

  // Find linked destinations in this country from TIMS database
  let destinations = queryAll(
    'SELECT * FROM destinations WHERE LOWER(country) LIKE LOWER(?) OR LOWER(country) = LOWER(?)',
    [`%${country.name}%`, country.code]
  );

  // If no destinations currently linked for this country, dynamically auto-provision
  // an authentic destination, boutique hotel, and 2 tour packages
  if (destinations.length === 0) {
    const capitalName = (country.capital && country.capital !== 'N/A') ? country.capital : country.name;
    const destName = `${capitalName}`;
    const destImage = country.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
    const category = country.region === 'Oceania' ? 'Beaches' : (country.region === 'Europe' ? 'Historical' : 'Plains');
    
    run(`
      INSERT INTO destinations (name, country, region, description, latitude, longitude, image_url, rating, best_season, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      destName,
      country.name,
      country.region,
      `${country.name} welcomes travelers with scenic wonders, vibrant culture, and captivating sights in ${destName}. ${country.summary ? country.summary.slice(0, 160) + '...' : ''}`,
      country.latitude || 20.0,
      country.longitude || 0.0,
      destImage,
      4.8,
      country.best_season || 'Spring & Autumn',
      category
    ]);

    const newDest = queryOne('SELECT * FROM destinations ORDER BY id DESC LIMIT 1');

    run(`
      INSERT INTO hotels (name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `${destName} Grand Heritage Hotel`,
      newDest.id,
      'luxury',
      240,
      4.8,
      60,
      'Pool,Spa,Restaurant,WiFi,Breakfast,Concierge',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      `Exquisite five-star hospitality in the heart of ${destName}, with panoramic city views and authentic amenities.`
    ]);

    const newHotel = queryOne('SELECT * FROM hotels ORDER BY id DESC LIMIT 1');

    run(`
      INSERT INTO packages (name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `${country.name} Grand Discovery Tour`,
      newDest.id,
      newHotel.id,
      `Experience the best of ${country.name} — guided tours of ${destName}, iconic cultural sights, local gastronomy, and hand-crafted excursions.`,
      350,
      6,
      10,
      1.15,
      destImage
    ]);
    const pkg1 = queryOne('SELECT * FROM packages ORDER BY id DESC LIMIT 1');
    run('INSERT INTO addons (package_id, name, description, price) VALUES (?, ?, ?, ?)',
      [pkg1.id, 'VIP Airport Transfer', 'Private executive airport pickup & return', 70]);
    run('INSERT INTO addons (package_id, name, description, price) VALUES (?, ?, ?, ?)',
      [pkg1.id, 'Private Heritage & Landmark Tour', 'Full-day certified guide tour with skip-the-line passes', 110]);

    run(`
      INSERT INTO packages (name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `${country.name} Scenic Explorer & Countryside Stay`,
      newDest.id,
      newHotel.id,
      `A leisurely 8-day itinerary exploring scenic landscapes, natural heritage, and cultural retreats across ${country.name}.`,
      490,
      8,
      12,
      1.1,
      destImage
    ]);
    const pkg2 = queryOne('SELECT * FROM packages ORDER BY id DESC LIMIT 1');
    run('INSERT INTO addons (package_id, name, description, price) VALUES (?, ?, ?, ?)',
      [pkg2.id, 'All-Access Excursion Pass', 'Entrance to top historical and natural reserves', 130]);

    saveDb();

    destinations = [newDest];
  }

  // Find packages connected to those destinations
  let packages = [];
  let hotels = [];
  if (destinations.length > 0) {
    const destIds = destinations.map(d => d.id).join(',');
    packages = queryAll(`
      SELECT p.*, h.name as hotel_name, d.name as destination_name 
      FROM packages p 
      JOIN hotels h ON p.hotel_id = h.id 
      JOIN destinations d ON p.dest_id = d.id 
      WHERE p.dest_id IN (${destIds}) AND p.is_active = 1
    `);
    hotels = queryAll(`SELECT * FROM hotels WHERE dest_id IN (${destIds})`);
  }

  // Try to enrich with Wikipedia article snippet if summary is default
  let wikiExtract = null;
  let wikiImage = null;
  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country.name)}`,
      { headers: { 'User-Agent': 'TIMS-World-Tourism/1.0' }, signal: AbortSignal.timeout(2500) }
    );
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract) wikiExtract = wikiData.extract;
      if (wikiData.originalimage?.source || wikiData.thumbnail?.source) {
        wikiImage = wikiData.originalimage?.source || wikiData.thumbnail?.source;
      }
    }
  } catch (err) {
    // Graceful fallback to stored summary
  }

  res.json({
    country: {
      ...country,
      summary: wikiExtract || country.summary,
      cover_image: wikiImage || country.cover_image
    },
    destinations,
    packages,
    hotels
  });
};
