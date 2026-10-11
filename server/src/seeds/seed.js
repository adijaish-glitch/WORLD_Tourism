const { initDb, getDb, saveDb } = require('../db/connection');
const { migrate } = require('../db/migrate');
const bcrypt = require('bcryptjs');

async function seed() {
  await initDb();
  migrate();
  const db = getDb();

  // Check if already seeded
  const stmt = db.prepare('SELECT COUNT(*) as c FROM destinations');
  stmt.step();
  const count = stmt.getAsObject().c;
  stmt.free();
  if (count > 0) { console.log('✓ Already seeded'); return; }

  const hash = await bcrypt.hash('admin123', 10);
  const custHash = await bcrypt.hash('password123', 10);

  // Users
  db.run("INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)", ['admin@tims.com', hash, 'Admin User', '+1-555-0100', 'admin']);
  db.run("INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)", ['john@example.com', custHash, 'John Doe', '+1-555-0200', 'customer']);
  db.run("INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)", ['jane@example.com', custHash, 'Jane Smith', '+1-555-0300', 'customer']);

  // 12 Real Destinations with accurate coordinates
  const destinations = [
    ['Paris', 'France', 'Europe', 'The City of Light captivates with its iconic landmarks, world-class cuisine, and timeless elegance. From the Eiffel Tower to Montmartre, every corner tells a story.', 48.8566, 2.3522, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 4.8, 'Spring'],
    ['Tokyo', 'Japan', 'Asia', 'A mesmerizing blend of ultramodern technology and ancient traditions. Experience neon-lit Shibuya, serene temples, and the finest sushi in the world.', 35.6762, 139.6503, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 4.9, 'Spring'],
    ['New York', 'United States', 'North America', 'The city that never sleeps offers world-famous attractions, Broadway shows, Central Park, and an unmatched energy that pulses through its streets.', 40.7128, -74.0060, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 4.7, 'Fall'],
    ['Santorini', 'Greece', 'Europe', 'White-washed buildings cascading down volcanic cliffs, crystal-clear Aegean waters, and sunsets that will take your breath away.', 36.3932, 25.4615, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 4.9, 'Summer'],
    ['Bali', 'Indonesia', 'Asia', 'Island of the Gods — lush rice terraces, ancient temples, vibrant culture, and pristine beaches create an unforgettable tropical paradise.', -8.3405, 115.0920, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 4.7, 'Summer'],
    ['Machu Picchu', 'Peru', 'South America', 'The legendary Lost City of the Incas perched high in the Andes. A UNESCO World Heritage site and one of the New Seven Wonders of the World.', -13.1631, -72.5450, 'https://images.unsplash.com/photo-1587595431973-160d0d163dad?w=800', 4.8, 'Winter'],
    ['Dubai', 'UAE', 'Middle East', 'A futuristic metropolis rising from the desert — record-breaking skyscrapers, luxury shopping, artificial islands, and year-round sunshine.', 25.2048, 55.2708, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 4.6, 'Winter'],
    ['Sydney', 'Australia', 'Oceania', 'Harbour city with iconic landmarks, beautiful beaches, and a vibrant cultural scene. The Opera House and Bondi Beach are just the beginning.', -33.8688, 151.2093, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', 4.7, 'Summer'],
    ['Cape Town', 'South Africa', 'Africa', 'Where Table Mountain meets the Atlantic Ocean. Stunning landscapes, diverse wildlife, world-class vineyards, and rich cultural heritage.', -33.9249, 18.4241, 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 4.6, 'Spring'],
    ['Maldives', 'Maldives', 'Asia', 'A tropical paradise of crystal-clear lagoons, overwater villas, and vibrant coral reefs. The ultimate escape for romance and relaxation.', 3.2028, 73.2207, 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 4.9, 'Winter'],
    ['Rome', 'Italy', 'Europe', 'The Eternal City where ancient ruins stand alongside Renaissance masterpieces. The Colosseum, Vatican, and world-famous cuisine await.', 41.9028, 12.4964, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', 4.8, 'Spring'],
    ['Kyoto', 'Japan', 'Asia', 'Japan\'s cultural heart — thousands of classical Buddhist temples, Shinto shrines, imperial palaces, and traditional wooden houses nestled among bamboo groves.', 35.0116, 135.7681, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 4.8, 'Fall'],
  ];

  destinations.forEach(d => {
    db.run('INSERT INTO destinations (name, country, region, description, latitude, longitude, image_url, rating, best_season) VALUES (?,?,?,?,?,?,?,?,?)', d);
  });

  // Hotels (2-3 per destination)
  const hotels = [
    ['Le Grand Paris', 1, 'luxury', 450, 4.9, 120, 'Spa,Pool,Restaurant,Concierge,Room Service', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'Five-star luxury in the heart of Paris'],
    ['Paris Budget Inn', 1, 'budget', 89, 3.8, 60, 'WiFi,Breakfast', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', 'Affordable comfort near major attractions'],
    ['Tokyo Imperial Hotel', 2, 'luxury', 520, 4.8, 200, 'Spa,Pool,Restaurant,Gym,Concierge', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 'Traditional Japanese hospitality meets modern luxury'],
    ['Shibuya Stay', 2, 'standard', 150, 4.2, 80, 'WiFi,Restaurant,Laundry', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'Modern hotel in the heart of Shibuya'],
    ['The Manhattan Elite', 3, 'premium', 380, 4.6, 250, 'Spa,Restaurant,Gym,Concierge,Bar', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 'Iconic New York luxury with skyline views'],
    ['NYC Hostel Plus', 3, 'budget', 75, 3.5, 100, 'WiFi,Kitchen,Lounge', 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800', 'Budget-friendly accommodation in Manhattan'],
    ['Santorini Sunset Suites', 4, 'luxury', 600, 4.9, 30, 'Pool,Spa,Restaurant,Bar,Sea View', 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800', 'Cliff-side suites with caldera views'],
    ['Bali Paradise Resort', 5, 'premium', 200, 4.5, 100, 'Pool,Spa,Restaurant,Beach Access,Yoga', 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800', 'Tropical resort amid rice terraces'],
    ['Bali Backpacker Lodge', 5, 'budget', 35, 4.0, 40, 'WiFi,Pool,Restaurant', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', 'Laid-back accommodation for adventurers'],
    ['Inca Trail Lodge', 6, 'standard', 120, 4.3, 40, 'WiFi,Restaurant,Tours,Heating', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', 'Mountain lodge near Machu Picchu'],
    ['Burj Al Arab Suites', 7, 'luxury', 1200, 4.9, 200, 'Pool,Spa,Helipad,Restaurant,Butler', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 'The world\'s most luxurious hotel'],
    ['Dubai Marina Hotel', 7, 'premium', 250, 4.4, 150, 'Pool,Gym,Restaurant,Bar', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', 'Modern comfort with marina views'],
    ['Sydney Harbour Grand', 8, 'luxury', 400, 4.7, 180, 'Pool,Spa,Restaurant,Harbour View', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'Luxury overlooking Sydney Harbour'],
    ['Table Bay Resort', 9, 'premium', 180, 4.5, 100, 'Pool,Spa,Restaurant,Safari Tours', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'Waterfront luxury at Table Bay'],
    ['Maldives Overwater Villa', 10, 'luxury', 800, 4.9, 50, 'Pool,Spa,Diving,Snorkeling,Butler', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800', 'Private overwater bungalows'],
    ['Hotel Roma Antica', 11, 'premium', 220, 4.6, 90, 'Restaurant,Bar,Rooftop,Tours', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'Historic elegance near the Colosseum'],
    ['Kyoto Garden Ryokan', 12, 'premium', 280, 4.8, 25, 'Onsen,Garden,Tea Ceremony,Breakfast', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', 'Authentic Japanese ryokan experience'],
  ];

  hotels.forEach(h => {
    db.run('INSERT INTO hotels (name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description) VALUES (?,?,?,?,?,?,?,?,?)', h);
  });

  // Packages
  const packages = [
    ['Romantic Paris Getaway', 1, 1, 'A 5-day romantic escape through Paris — private Eiffel Tower dining, Seine river cruise, and Versailles day trip.', 320, 5, 4, 1.2, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'],
    ['Paris on a Budget', 1, 2, 'Experience the magic of Paris without breaking the bank. Walking tours, local bistros, and hidden gems.', 65, 4, 10, 1.0, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'],
    ['Tokyo Adventure', 2, 3, 'Explore Tokyo\'s neon-lit streets, ancient shrines, and culinary wonders. Includes Akihabara, Tsukiji, and Mt. Fuji day trip.', 400, 7, 8, 1.3, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'],
    ['NYC City Explorer', 3, 5, 'The ultimate New York experience — Broadway show, Statue of Liberty, Central Park, and rooftop dining.', 280, 5, 10, 1.1, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'],
    ['Santorini Dream', 4, 7, 'A luxurious Greek island escape — caldera views, wine tasting, boat tours, and sunset dinners.', 450, 6, 4, 1.4, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'],
    ['Bali Wellness Retreat', 5, 8, 'Reconnect with yourself through yoga, meditation, spa treatments, and Balinese healing traditions.', 150, 7, 12, 1.0, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'],
    ['Bali Backpacker Trail', 5, 9, 'Explore Bali\'s hidden waterfalls, rice terraces, and surf beaches on a budget-friendly adventure.', 25, 10, 20, 0.9, 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800'],
    ['Machu Picchu Trek', 6, 10, 'Trek the legendary Inca Trail to the Lost City. Includes guided tours, camping, and cultural experiences.', 90, 4, 15, 1.2, 'https://images.unsplash.com/photo-1587595431973-160d0d163dad?w=800'],
    ['Dubai Luxury Experience', 7, 11, 'Live like royalty — desert safari, Burj Khalifa, palm island tour, and gold souk shopping.', 900, 5, 6, 1.5, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'],
    ['Sydney Coastal Tour', 8, 13, 'Discover Sydney\'s stunning coastline — Bondi to Coogee walk, harbour cruise, Blue Mountains day trip.', 300, 5, 10, 1.1, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800'],
    ['Cape Town Safari & City', 9, 14, 'The best of both worlds — Table Mountain, Cape Winelands, penguin colony, and Big Five safari.', 140, 7, 12, 1.0, 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'],
    ['Maldives Paradise Escape', 10, 15, 'Ultimate luxury — private island, overwater villa, snorkeling, sunset dolphin cruise.', 650, 5, 2, 1.6, 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800'],
    ['Eternal Rome Explorer', 11, 16, 'Walk through 3,000 years of history — Colosseum, Vatican Museums, Trastevere food tour, and Pompeii day trip.', 170, 5, 15, 1.1, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800'],
  ];

  packages.forEach(p => {
    db.run('INSERT INTO packages (name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url) VALUES (?,?,?,?,?,?,?,?,?)', p);
  });

  // Addons
  const addons = [
    [1, 'Private Airport Transfer', 'Luxury car pickup from CDG airport', 75],
    [1, 'Seine River Dinner Cruise', 'Romantic dinner on the Seine', 120],
    [3, 'Mt. Fuji Day Trip', 'Full-day guided trip to Mt. Fuji', 95],
    [3, 'Sumo Wrestling Experience', 'Watch morning sumo practice', 45],
    [4, 'Broadway Show Tickets', 'Premium seats for a top Broadway show', 150],
    [5, 'Volcano Boat Tour', 'Private catamaran to the volcanic hot springs', 80],
    [5, 'Wine Tasting Tour', 'Visit 3 Santorini wineries', 65],
    [6, 'Surf Lesson', 'Private surfing lesson in Bali', 40],
    [6, 'Balinese Cooking Class', 'Learn traditional Balinese cooking', 35],
    [9, 'Desert Safari', 'Sunset desert safari with BBQ dinner', 100],
    [9, 'Helicopter Tour', 'Aerial tour over Palm Jumeirah', 250],
    [12, 'Sunset Dolphin Cruise', 'Private dolphin watching cruise', 120],
    [12, 'Underwater Dining', 'Dinner at an underwater restaurant', 200],
  ];

  addons.forEach(a => {
    db.run('INSERT INTO addons (package_id, name, description, price) VALUES (?,?,?,?)', a);
  });

  // Reviews
  const reviews = [
    [1, 2, 'John Doe', 5, 'Paris was absolutely magical! The Eiffel Tower at night is unforgettable.'],
    [1, 3, 'Jane Smith', 4, 'Beautiful city with amazing food. A bit crowded in summer though.'],
    [2, 2, 'John Doe', 5, 'Tokyo blew my mind. The blend of old and new is incredible.'],
    [4, 3, 'Jane Smith', 5, 'Santorini sunsets are everything they say and more. Pure magic.'],
    [5, 2, 'John Doe', 4, 'Bali is paradise. The rice terraces and temples were highlights.'],
    [10, 3, 'Jane Smith', 5, 'The Maldives is heaven on earth. Crystal clear water everywhere.'],
    [11, 2, 'John Doe', 5, 'Rome is a living museum. The Colosseum left me speechless.'],
    [3, 3, 'Jane Smith', 4, 'NYC is electric! So much to see and do, we need to go back.'],
  ];

  reviews.forEach(r => {
    db.run('INSERT INTO reviews (dest_id, user_id, reviewer_name, rating, comment) VALUES (?,?,?,?,?)', r);
  });

  // Sample bookings
  const bookings = [
    [2, 1, '2024-12-15', '2024-12-20', 2, 3840, 'confirmed', 'credit_card', null, '[]'],
    [2, 3, '2024-11-10', '2024-11-14', 2, 1280, 'confirmed', 'paypal', null, '[]'],
    [3, 5, '2025-01-05', '2025-01-09', 1, 1560, 'confirmed', 'credit_card', null, '[]'],
    [2, 6, '2025-02-14', '2025-02-21', 2, 2100, 'cancelled', 'bank_transfer', 'Anniversary trip', '[]'],
  ];

  bookings.forEach(b => {
    db.run('INSERT INTO bookings (user_id, package_id, check_in, check_out, travelers, total_price, status, payment_method, notes, addon_ids) VALUES (?,?,?,?,?,?,?,?,?,?)', b);
  });

  saveDb();
  console.log('✓ Seed data inserted');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { seed };
