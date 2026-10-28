const { getDb, saveDb } = require('../db/connection');

async function seedTravelProviders() {
  const db = getDb();

  // Check if travel_providers already seeded
  const stmt = db.prepare('SELECT COUNT(*) as c FROM travel_providers');
  stmt.step();
  const count = stmt.getAsObject().c;
  stmt.free();

  if (count === 0) {
    console.log('🌱 Seeding Travel Providers & Authorized Partner Integrations...');

    const providers = [
      {
        provider_code: 'TIMS_DIRECT',
        name: 'TIMS Direct Booking',
        category: 'direct',
        website_url: 'https://tims-tourism.onrender.com',
        affiliate_id: null,
        supports_direct_booking: 1,
        is_active: 1,
        api_endpoint: '/api/bookings'
      },
      {
        provider_code: 'MAKEMYTRIP',
        name: 'MakeMyTrip Official Partner',
        category: 'meta',
        website_url: 'https://www.makemytrip.com',
        affiliate_id: 'TIMS_PARTNER_MMT',
        supports_direct_booking: 0,
        is_active: 1,
        api_endpoint: 'https://mypartner.makemytrip.com'
      },
      {
        provider_code: 'AMADEUS',
        name: 'Amadeus Travel API Network',
        category: 'flights',
        website_url: 'https://developers.amadeus.com',
        affiliate_id: 'TIMS_AMADEUS_DEV',
        supports_direct_booking: 0,
        is_active: 1,
        api_endpoint: 'https://test.api.amadeus.com'
      },
      {
        provider_code: 'IRCTC_OFFICIAL',
        name: 'IRCTC Tourism & Indian Railways',
        category: 'trains',
        website_url: 'https://www.irctctourism.com',
        affiliate_id: null,
        supports_direct_booking: 0,
        is_active: 1,
        api_endpoint: 'https://www.irctc.co.in'
      },
      {
        provider_code: 'REDBUS_PARTNER',
        name: 'RedBus Verified Operator Hub',
        category: 'buses',
        website_url: 'https://www.redbus.in',
        affiliate_id: 'TIMS_BUS_AFFILIATE',
        supports_direct_booking: 0,
        is_active: 1,
        api_endpoint: 'https://www.redbus.in'
      },
      {
        provider_code: 'EXPEDIA_AFFILIATE',
        name: 'Expedia Partner Solutions',
        category: 'hotels',
        website_url: 'https://www.expedia.com',
        affiliate_id: 'TIMS_EXPEDIA_EXP',
        supports_direct_booking: 0,
        is_active: 1,
        api_endpoint: 'https://api.ean.com'
      }
    ];

    providers.forEach(p => {
      db.run(
        `INSERT INTO travel_providers (provider_code, name, category, website_url, affiliate_id, supports_direct_booking, is_active, api_endpoint)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.provider_code, p.name, p.category, p.website_url, p.affiliate_id, p.supports_direct_booking, p.is_active, p.api_endpoint]
      );
    });
  }

  // Check external_offers count
  const offerStmt = db.prepare('SELECT COUNT(*) as c FROM external_offers');
  offerStmt.step();
  const offerCount = offerStmt.getAsObject().c;
  offerStmt.free();

  if (offerCount === 0) {
    console.log('🌱 Seeding Sample Travel Discovery Inventory (Flights, Trains, Buses, External Hotels & Packages)...');

    const sampleOffers = [
      // 1. FLIGHT OFFERS (Amadeus / MakeMyTrip Partner)
      {
        provider_code: 'AMADEUS',
        category: 'flights',
        title: 'Non-stop Flight: New York (JFK) to Paris (CDG)',
        origin: 'New York (JFK)',
        destination: 'Paris (CDG)',
        price: 520,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com/flights',
        rating: 4.8,
        image_url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'Air France / SkyTeam',
        departure_time: '18:30 (JFK)',
        arrival_time: '07:45+1 (CDG)',
        duration: '7h 15m',
        stops_or_class: 'Non-stop · Economy Class',
        amenities_or_terms: 'Cabin bag + 1 Checked bag (23kg), Free meal, In-flight WiFi'
      },
      {
        provider_code: 'AMADEUS',
        category: 'flights',
        title: 'Dubai Express: London (LHR) to Dubai (DXB)',
        origin: 'London (LHR)',
        destination: 'Dubai (DXB)',
        price: 460,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com/flights',
        rating: 4.9,
        image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'Emirates',
        departure_time: '14:20 (LHR)',
        arrival_time: '00:30+1 (DXB)',
        duration: '7h 10m',
        stops_or_class: 'Non-stop · Economy / Flex',
        amenities_or_terms: '2x 23kg Baggage, Multi-course dining, Seatback entertainment'
      },
      {
        provider_code: 'MAKEMYTRIP',
        category: 'flights',
        title: 'Tropical Hop: Mumbai (BOM) to Goa (GOI)',
        origin: 'Mumbai (BOM)',
        destination: 'Goa (GOI)',
        price: 58,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com/flights',
        rating: 4.6,
        image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'IndiGo / 6E',
        departure_time: '09:15 (BOM)',
        arrival_time: '10:35 (GOI)',
        duration: '1h 20m',
        stops_or_class: 'Non-stop · Regular',
        amenities_or_terms: '15kg Check-in bag + 7kg Hand luggage, Instant e-ticket'
      },
      {
        provider_code: 'AMADEUS',
        category: 'flights',
        title: 'Asia Gateway: Singapore (SIN) to Tokyo (HND)',
        origin: 'Singapore (SIN)',
        destination: 'Tokyo (HND)',
        price: 490,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com/flights',
        rating: 4.9,
        image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'Singapore Airlines',
        departure_time: '23:55 (SIN)',
        arrival_time: '07:30+1 (HND)',
        duration: '6h 35m',
        stops_or_class: 'Non-stop · Premium Economy Available',
        amenities_or_terms: '30kg Baggage, Premium meals, High-speed satellite WiFi'
      },

      // 2. TRAIN OFFERS (IRCTC / Rail Partners)
      {
        provider_code: 'IRCTC_OFFICIAL',
        category: 'trains',
        title: 'Vande Bharat Express (Train #22436)',
        origin: 'New Delhi (NDLS)',
        destination: 'Varanasi Junction (BSB)',
        price: 24,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.irctctourism.com',
        rating: 4.8,
        image_url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'Indian Railways / IRCTC',
        departure_time: '06:00 (NDLS)',
        arrival_time: '14:00 (BSB)',
        duration: '8h 00m',
        stops_or_class: 'AC Chair Car (CC) / Executive (EC)',
        amenities_or_terms: 'Hot breakfast & lunch included, Rotating ergonomic seats, Bio-vacuum restrooms'
      },
      {
        provider_code: 'IRCTC_OFFICIAL',
        category: 'trains',
        title: 'Rajdhani Express (Train #12952)',
        origin: 'New Delhi (NDLS)',
        destination: 'Mumbai Central (MMCT)',
        price: 42,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.irctc.co.in',
        rating: 4.7,
        image_url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'Indian Railways',
        departure_time: '16:55 (NDLS)',
        arrival_time: '08:35+1 (MMCT)',
        duration: '15h 40m',
        stops_or_class: '1st AC (1A) / 2nd AC (2A) / 3rd AC (3A)',
        amenities_or_terms: 'Clean bedding linen provided, Dinner & morning tea included, Dynamic fare'
      },
      {
        provider_code: 'IRCTC_OFFICIAL',
        category: 'trains',
        title: 'Eurostar High-Speed (Train #ES9018)',
        origin: 'London St Pancras',
        destination: 'Paris Gare du Nord',
        price: 78,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com',
        rating: 4.9,
        image_url: 'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'Eurostar International',
        departure_time: '10:24 (STP)',
        arrival_time: '13:50 (GDN)',
        duration: '2h 26m',
        stops_or_class: 'Standard / Plus / Premier',
        amenities_or_terms: 'City-center to city-center, 2 bags + hand luggage, Free high-speed WiFi'
      },

      // 3. BUS OFFERS (RedBus / MakeMyTrip Partner)
      {
        provider_code: 'REDBUS_PARTNER',
        category: 'buses',
        title: 'Intercity Multi-Axle Volvo AC Sleeper',
        origin: 'Bengaluru',
        destination: 'Goa (Panaji)',
        price: 18,
        currency: 'USD',
        price_basis: 'per_seat',
        is_estimated: 1,
        deep_link: 'https://www.redbus.in',
        rating: 4.7,
        image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'KSRTC FlyBus / Intrcity SmartBus',
        departure_time: '21:30 (Majestic)',
        arrival_time: '07:30+1 (Panaji)',
        duration: '10h 00m',
        stops_or_class: 'AC Sleeper (2+1)',
        amenities_or_terms: 'Individual AC vents, Reading lamp, Blanket, Water bottle, Live GPS tracking'
      },
      {
        provider_code: 'REDBUS_PARTNER',
        category: 'buses',
        title: 'Scania High-Deck Luxury Coach',
        origin: 'New Delhi (ISBT Kashmere Gate)',
        destination: 'Manali (Mall Road)',
        price: 22,
        currency: 'USD',
        price_basis: 'per_seat',
        is_estimated: 1,
        deep_link: 'https://www.redbus.in',
        rating: 4.6,
        image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'HPTDC Luxury Service',
        departure_time: '19:00 (ISBT)',
        arrival_time: '08:30+1 (Manali)',
        duration: '13h 30m',
        stops_or_class: 'AC Semi-Sleeper (2+2)',
        amenities_or_terms: 'Reclining pushback seats, Emergency exit, USB charging ports'
      },

      // 4. EXTERNAL HOTEL OFFERS (MakeMyTrip / Expedia)
      {
        provider_code: 'MAKEMYTRIP',
        category: 'hotels',
        title: 'The Taj Mahal Palace, Mumbai',
        origin: null,
        destination: 'Mumbai',
        price: 260,
        currency: 'USD',
        price_basis: 'per_night',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com/hotels',
        rating: 4.9,
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'IHCL / Taj Group',
        departure_time: 'Check-in: 14:00',
        arrival_time: 'Check-out: 12:00',
        duration: 'Per Night',
        stops_or_class: '5-Star Luxury Heritage',
        amenities_or_terms: 'Harbor view, Outdoor pool, Luxury Jiva Spa, Free cancellation up to 24h'
      },
      {
        provider_code: 'MAKEMYTRIP',
        category: 'hotels',
        title: 'Burj Al Arab Jumeirah',
        origin: null,
        destination: 'Dubai',
        price: 1100,
        currency: 'USD',
        price_basis: 'per_night',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com/hotels',
        rating: 5.0,
        image_url: 'https://images.unsplash.com/photo-1512453979498-5ea266f8e320?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'Jumeirah Hotels',
        departure_time: 'Check-in: 15:00',
        arrival_time: 'Check-out: 12:00',
        duration: 'Per Night',
        stops_or_class: 'Ultra Luxury 7-Star Suite',
        amenities_or_terms: 'Private butler, Helipad arrival, Private beach, Infinity terrace pool'
      },

      // 5. HOLIDAY PACKAGES (MakeMyTrip Partner Tours)
      {
        provider_code: 'MAKEMYTRIP',
        category: 'packages',
        title: 'Exotic Bali & Nusa Penida Island Gateway',
        origin: 'Global Departures',
        destination: 'Bali, Indonesia',
        price: 680,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com/holidays-international',
        rating: 4.8,
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'MakeMyTrip Curated Holidays',
        departure_time: '6 Days / 5 Nights',
        arrival_time: 'Includes 4-Star Resort',
        duration: '6 Days',
        stops_or_class: 'Flights + 4-Star Hotels + Speedboat Transfers',
        amenities_or_terms: 'Daily breakfast, Private AC car tours, Nusa Penida day trip, Travel insurance'
      },
      {
        provider_code: 'MAKEMYTRIP',
        category: 'packages',
        title: 'Grand Swiss Alps & Glacier Express Panorama',
        origin: 'Zurich / Geneva',
        destination: 'Switzerland',
        price: 1450,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 1,
        deep_link: 'https://www.makemytrip.com/holidays-international',
        rating: 4.9,
        image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'MakeMyTrip International Escapes',
        departure_time: '7 Days / 6 Nights',
        arrival_time: 'Includes Swiss Travel Pass',
        duration: '7 Days',
        stops_or_class: 'Scenic Rail + 4-Star Alpine Lodges',
        amenities_or_terms: 'Unlimited panoramic trains, Mount Titlis cable car, Interlaken & Zermatt stay'
      }
    ];

    sampleOffers.forEach(o => {
      db.run(
        `INSERT INTO external_offers 
         (provider_code, category, title, origin, destination, price, currency, price_basis, is_estimated, deep_link, rating, image_url, operator_or_airline, departure_time, arrival_time, duration, stops_or_class, amenities_or_terms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [o.provider_code, o.category, o.title, o.origin, o.destination, o.price, o.currency, o.price_basis, o.is_estimated, o.deep_link, o.rating, o.image_url, o.operator_or_airline, o.departure_time, o.arrival_time, o.duration, o.stops_or_class, o.amenities_or_terms]
      );
    });

    console.log(`✓ Seeded ${sampleOffers.length} multi-modal discovery offers.`);
  }

  saveDb();
}

module.exports = { seedTravelProviders };
