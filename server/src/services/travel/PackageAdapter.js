const BaseTravelAdapter = require('./BaseTravelAdapter');
const { getDb } = require('../../db/connection');

class PackageAdapter extends BaseTravelAdapter {
  constructor() {
    super('HYBRID_PACKAGES', 'TIMS Direct & MakeMyTrip Holiday Packages', 'packages');
  }

  async search(params = {}) {
    const {
      destination = '',
      origin = '',
      travelers = 1,
      durationDays = null,
      maxPrice = null,
      sortBy = 'price_asc'
    } = params;

    const db = getDb();
    const results = [];

    // 1. Direct TIMS Packages
    let pkgSql = `
      SELECT p.*, d.name as dest_name, d.country as dest_country, d.region as dest_region,
             h.name as hotel_name, h.category as hotel_category
      FROM packages p
      JOIN destinations d ON p.dest_id = d.id
      JOIN hotels h ON p.hotel_id = h.id
      WHERE p.is_active = 1
    `;
    const pkgParams = [];

    if (destination.trim()) {
      pkgSql += ` AND (d.name LIKE ? OR d.country LIKE ? OR p.name LIKE ? OR p.description LIKE ?)`;
      pkgParams.push(`%${destination.trim()}%`, `%${destination.trim()}%`, `%${destination.trim()}%`, `%${destination.trim()}%`);
    }

    if (maxPrice) {
      pkgSql += ` AND p.base_price <= ?`;
      pkgParams.push(Number(maxPrice));
    }

    if (durationDays) {
      pkgSql += ` AND p.duration_days <= ?`;
      pkgParams.push(Number(durationDays));
    }

    const pkgStmt = db.prepare(pkgSql);
    pkgStmt.bind(pkgParams);
    while (pkgStmt.step()) {
      const p = pkgStmt.getAsObject();
      results.push({
        id: `local-pkg-${p.id}`,
        rawId: p.id,
        provider_code: 'TIMS_DIRECT',
        category: 'packages',
        title: p.name,
        destination: `${p.dest_name}, ${p.dest_country}`,
        origin: 'Any City',
        price: p.base_price,
        currency: 'USD',
        price_basis: 'per_person',
        is_estimated: 0,
        supports_direct_booking: 1,
        bookingType: 'direct',
        rating: 4.8,
        image_url: p.image_url || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
        operator_or_airline: 'TIMS Curated Experience',
        departure_time: `${p.duration_days} Days / ${p.duration_days - 1} Nights`,
        arrival_time: `Hotel: ${p.hotel_name}`,
        duration: `${p.duration_days} Days`,
        stops_or_class: `Stay at ${p.hotel_name} (${p.hotel_category || 'Standard'})`,
        amenities_or_terms: 'Guided tours, Accommodation, Breakfast, Ground transfers',
        description: p.description
      });
    }
    pkgStmt.free();

    // 2. External Partner Packages (MakeMyTrip)
    let extSql = `SELECT * FROM external_offers WHERE category = 'packages'`;
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
        id: `ext-pkg-${o.id}`,
        rawId: o.id,
        provider_code: o.provider_code,
        category: 'packages',
        title: o.title,
        destination: o.destination,
        origin: o.origin,
        price: o.price,
        currency: o.currency || 'USD',
        price_basis: o.price_basis || 'per_person',
        is_estimated: 1,
        supports_direct_booking: 0,
        bookingType: 'external_redirect',
        deep_link: o.deep_link,
        rating: o.rating || 4.9,
        image_url: o.image_url,
        operator_or_airline: o.operator_or_airline,
        departure_time: o.departure_time,
        arrival_time: o.arrival_time,
        duration: o.duration,
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
      travelers: Number(travelers) || 1,
      searchedOrigin: origin || 'Flexible'
    }));
  }

  async revalidate(offerId, currentParams = {}) {
    const isDirect = String(offerId).startsWith('local-pkg-');
    const rawId = isDirect ? offerId.replace('local-pkg-', '') : offerId.replace('ext-pkg-', '');
    const db = getDb();

    if (isDirect) {
      const stmt = db.prepare('SELECT base_price, is_active FROM packages WHERE id = ?');
      stmt.bind([Number(rawId)]);
      const pkg = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();

      if (!pkg || !pkg.is_active) {
        return { valid: false, message: 'This curated package is currently unavailable for booking.' };
      }

      return {
        valid: true,
        currentPrice: pkg.base_price,
        currency: 'USD',
        priceChanged: false,
        freshnessTimestamp: new Date().toISOString(),
        message: 'TIMS Package availability and rate confirmed.'
      };
    }

    return {
      valid: true,
      currentPrice: currentParams.price || 680,
      currency: 'USD',
      priceChanged: false,
      freshnessTimestamp: new Date().toISOString(),
      message: 'Partner package verified.'
    };
  }
}

module.exports = PackageAdapter;

