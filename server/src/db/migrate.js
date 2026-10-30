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
    { name: 'phone_verified', type: 'INTEGER DEFAULT 0' },
    { name: 'language', type: "TEXT DEFAULT 'en'" },
    { name: 'currency', type: "TEXT DEFAULT 'USD'" },
    { name: 'travel_preferences', type: "TEXT DEFAULT '{}'" },
    { name: 'notification_preferences', type: "TEXT DEFAULT '{\"booking_updates\":true,\"sms_alerts\":true,\"travel_reminders\":true,\"promotions\":false}'" },
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

  // Wishlist & Saved Places
  db.run(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('destination', 'hotel', 'package')),
      item_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      image_url TEXT,
      price REAL,
      rating REAL,
      link_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_type, item_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Saved Travellers
  db.run(`
    CREATE TABLE IF NOT EXISTS saved_travellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT DEFAULT 'unspecified' CHECK(gender IN ('male', 'female', 'other', 'unspecified')),
      phone TEXT,
      email TEXT,
      traveler_type TEXT DEFAULT 'adult' CHECK(traveler_type IN ('adult', 'child', 'infant')),
      meal_or_dietary TEXT,
      special_assistance TEXT,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Support Tickets
  db.run(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ticket_number TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('booking_inquiry', 'cancellation', 'flight_hotel_support', 'technical_issue', 'account_security', 'other')),
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      booking_reference TEXT,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'awaiting_user_response', 'resolved', 'closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Support Ticket Messages / Conversation History
  db.run(`
    CREATE TABLE IF NOT EXISTS support_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      sender_type TEXT NOT NULL CHECK(sender_type IN ('user', 'support', 'system')),
      sender_id INTEGER,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
    )
  `);

  // User Notifications Log
  db.run(`
    CREATE TABLE IF NOT EXISTS user_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('booking', 'security', 'system', 'sms')),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      link_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
  db.run("CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_travellers_user ON saved_travellers(user_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON support_messages(ticket_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_notifications(user_id)");

  saveDb();
  console.log('✓ Migrations applied');
}

module.exports = { migrate };
