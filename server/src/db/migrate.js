const { getDb, saveDb } = require('./connection');

function migrate() {
  const db = getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      is_active INTEGER DEFAULT 1,
      username TEXT,
      avatar_url TEXT,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires DATETIME,
      provider TEXT DEFAULT 'local',
      provider_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safely add any new columns to existing databases
  const userColumns = [
    { name: 'username', type: 'TEXT' },
    { name: 'avatar_url', type: 'TEXT' },
    { name: 'email_verified', type: 'INTEGER DEFAULT 0' },
    { name: 'verification_token', type: 'TEXT' },
    { name: 'reset_token', type: 'TEXT' },
    { name: 'reset_token_expires', type: 'DATETIME' },
    { name: 'provider', type: "TEXT DEFAULT 'local'" },
    { name: 'provider_id', type: 'TEXT' }
  ];

  userColumns.forEach(col => {
    try {
      db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
    } catch {
      // Column already exists, safe to ignore
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT,
      latitude REAL,
      longitude REAL,
      image_url TEXT,
      rating REAL DEFAULT 0,
      best_season TEXT,
      category TEXT DEFAULT 'Historical',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    db.run("ALTER TABLE destinations ADD COLUMN category TEXT DEFAULT 'Historical'");
  } catch {
    // Column already exists
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS hotels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dest_id INTEGER NOT NULL,
      category TEXT DEFAULT 'standard' CHECK(category IN ('budget', 'standard', 'premium', 'luxury')),
      price_per_night REAL NOT NULL,
      rating REAL DEFAULT 0,
      total_rooms INTEGER DEFAULT 50,
      amenities TEXT,
      image_url TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dest_id) REFERENCES destinations(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dest_id INTEGER NOT NULL,
      hotel_id INTEGER NOT NULL,
      description TEXT,
      base_price REAL NOT NULL,
      duration_days INTEGER DEFAULT 3,
      max_group_size INTEGER DEFAULT 20,
      seasonal_multiplier REAL DEFAULT 1.0,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dest_id) REFERENCES destinations(id) ON DELETE CASCADE,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS addons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      travelers INTEGER DEFAULT 1,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'pending', 'cancelled')),
      payment_method TEXT DEFAULT 'credit_card',
      notes TEXT,
      addon_ids TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dest_id INTEGER NOT NULL,
      user_id INTEGER,
      reviewer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dest_id) REFERENCES destinations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS countries (
      code TEXT PRIMARY KEY,
      code3 TEXT,
      name TEXT NOT NULL,
      official_name TEXT,
      capital TEXT,
      region TEXT,
      subregion TEXT,
      population INTEGER,
      area REAL,
      currencies TEXT,
      languages TEXT,
      flag_emoji TEXT,
      flag_url TEXT,
      flag_svg TEXT,
      latitude REAL,
      longitude REAL,
      borders TEXT,
      summary TEXT,
      cover_image TEXT,
      best_season TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add reference_number and payment_status to bookings table safely
  const bookingColumns = [
    { name: 'reference_number', type: 'TEXT' },
    { name: 'payment_status', type: "TEXT DEFAULT 'paid'" },
    { name: 'booking_type', type: "TEXT DEFAULT 'package'" },
    { name: 'provider_code', type: "TEXT DEFAULT 'TIMS_DIRECT'" },
    { name: 'freshness_timestamp', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
  ];

  bookingColumns.forEach(col => {
    try {
      db.run(`ALTER TABLE bookings ADD COLUMN ${col.name} ${col.type}`);
    } catch {
      // Column already exists
    }
  });

  // Travel Providers Table for Multi-Provider Hybrid Architecture
  db.run(`
    CREATE TABLE IF NOT EXISTS travel_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      website_url TEXT NOT NULL,
      affiliate_id TEXT,
      supports_direct_booking INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      api_endpoint TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // External & Hybrid Inventory Offers (Flights, Hotels, Trains, Buses, Packages)
  db.run(`
    CREATE TABLE IF NOT EXISTS external_offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_code TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      origin TEXT,
      destination TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      price_basis TEXT DEFAULT 'per_person',
      is_estimated INTEGER DEFAULT 0,
      deep_link TEXT NOT NULL,
      rating REAL DEFAULT 0,
      image_url TEXT,
      operator_or_airline TEXT,
      departure_time TEXT,
      arrival_time TEXT,
      duration TEXT,
      stops_or_class TEXT,
      amenities_or_terms TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Security Audit Logs
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      ip_address TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create performance indexes on frequently queried relational keys
  db.run("CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_packages_dest_id ON packages(dest_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_packages_hotel_id ON packages(hotel_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_hotels_dest_id ON hotels(dest_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_reviews_dest_id ON reviews(dest_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_countries_region ON countries(region)");
  db.run("CREATE INDEX IF NOT EXISTS idx_external_offers_cat_dest ON external_offers(category, destination)");
  db.run("CREATE INDEX IF NOT EXISTS idx_external_offers_provider ON external_offers(provider_code)");
  db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)");

  saveDb();
  console.log('✓ Migrations applied');
}

module.exports = { migrate };
