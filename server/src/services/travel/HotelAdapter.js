const BaseTravelAdapter = require('./BaseTravelAdapter');
const { getDb } = require('../../db/connection');

class HotelAdapter extends BaseTravelAdapter {
  constructor() {
    super('HYBRID_HOTELS', 'TIMS Direct & Partner Hotel Distribution', 'hotels');
  }

  async search(params = {}) {
    const {
      destination = '',
      checkIn = '',
      checkOut = '',
      guests = 2,
      rooms = 1,
      category = '',
      maxPrice = null,
      sortBy = 'rating'
    } = params;

    const db = getDb();
    const results = [];

    // 1. Query Local Direct-Booking Hotels
    let localSql = `
      SELECT h.*, d.name as dest_name, d.country as dest_country, d.region as dest_region
      FROM hotels h
      JOIN destinations d ON h.dest_id = d.id
      WHERE 1=1
    `;
    const localParams = [];

    if (destination.trim()) {
      localSql += ` AND (d.name LIKE ? OR d.country LIKE ? OR h.name LIKE ?)`;
      localParams.push(`%${destination.trim()}%`, `%${destination.trim()}%`, `%${destination.trim()}%`);
    }

    if (category.trim()) {
      localSql += ` AND h.category = ?`;
      localParams.push(category.trim());
    }

    if (maxPrice) {
      localSql += ` AND h.price_per_night <= ?`;
      localParams.push(Number(maxPrice));
    }

    const localStmt = db.prepare(localSql);
    localStmt.bind(localParams);
    while (localStmt.step()) {
      const h = localStmt.getAsObject();
      results.push({
        id: `local-hotel-${h.id}`,
        rawId: h.id,
        provider_code: 'TIMS_DIRECT',
        category: 'hotels',
        title: h.name,
        destination: `${h.dest_name}, ${h.dest_country}`,
        price: h.price_per_night,
        currency: 'USD',
        price_basis: 'per_night',
        is_estimated: 0,
        supports_direct_booking: 1,
        bookingType: 'direct',
        rating: h.rating || 4.5,
        image_url: h.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'TIMS Direct Property',
        stops_or_class: `${h.category ? h.category.toUpperCase() : 'STANDARD'} Room`,
        amenities_or_terms: h.amenities || 'WiFi, Breakfast included, AC, Swimming Pool',
        description: h.description,
        total_rooms: h.total_rooms
      });
    }
    localStmt.free();

    // 2. Query External / Partner Offers (MakeMyTrip, Expedia)
    let extSql = `SELECT * FROM external_offers WHERE category = 'hotels'`;
    const extParams = [];

    if (destination.trim()) {
      extSql += ` AND (destination LIKE ? OR title LIKE ?)`;
      extParams.push(`%${destination.trim()}%`, `%${destination.trim()}%`);
    }

    if (maxPrice) {
      extSql += ` AND price <= ?`;
      extParams.push(Number(maxPrice));
    }

    const extStmt = db.prepare(extSql);
    extStmt.bind(extParams);
    while (extStmt.step()) {
      const o = extStmt.getAsObject();
      results.push({
        id: `ext-hotel-${o.id}`,
        rawId: o.id,
        provider_code: o.provider_code,
        category: 'hotels',
        title: o.title,
        destination: o.destination,
        price: o.price,
        currency: o.currency || 'USD',
        price_basis: o.price_basis || 'per_night',
        is_estimated: 1,
        supports_direct_booking: 0,
        bookingType: 'external_redirect',
        deep_link: o.deep_link,
        rating: o.rating || 4.8,
        image_url: o.image_url,
        operator_or_airline: o.operator_or_airline,
        stops_or_class: o.stops_or_class,
        amenities_or_terms: o.amenities_or_terms
      });
    }
    extStmt.free();

    // Sorting
    if (sortBy === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return results.map(r => this.formatOffer({
      ...r,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      guests: Number(guests) || 2,
      rooms: Number(rooms) || 1
    }));
  }

  async revalidate(offerId, currentParams = {}) {
    const isDirect = String(offerId).startsWith('local-hotel-');
    const rawId = isDirect ? offerId.replace('local-hotel-', '') : offerId.replace('ext-hotel-', '');
    const db = getDb();

    if (isDirect) {
      const stmt = db.prepare('SELECT price_per_night FROM hotels WHERE id = ?');
      stmt.bind([Number(rawId)]);
      const hotel = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();

      if (!hotel) {
        return { valid: false, message: 'Hotel no longer available.' };
      }

      return {
        valid: true,
        currentPrice: hotel.price_per_night,
        currency: 'USD',
        priceChanged: false,
        freshnessTimestamp: new Date().toISOString(),
        message: 'Direct hotel rate verified.'
      };
    }

    const extStmt = db.prepare('SELECT price, currency FROM external_offers WHERE id = ?');
    extStmt.bind([Number(rawId)]);
    const offer = extStmt.step() ? extStmt.getAsObject() : null;
    extStmt.free();

    if (!offer) {
      return { valid: false, message: 'External partner hotel quote expired.' };
    }

    return {
      valid: true,
      currentPrice: offer.price,
      currency: offer.currency,
      priceChanged: false,
      freshnessTimestamp: new Date().toISOString(),
      message: 'Partner quote revalidated.'
    };
  }
}

module.exports = HotelAdapter;

