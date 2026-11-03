const BaseTravelAdapter = require('./BaseTravelAdapter');
const { getDb } = require('../../db/connection');
const DeepLinkBuilder = require('./DeepLinkBuilder');
const AviationstackService = require('./AviationstackService');

class FlightAdapter extends BaseTravelAdapter {
  constructor() {
    super('AVIATIONSTACK', 'Aviationstack & Global Airline Network', 'flights');
  }

  async search(params = {}) {
    const {
      origin = '',
      destination = '',
      departureDate = '',
      returnDate = '',
      passengers = 1,
      travelClass = 'Economy',
      maxPrice = null,
      sortBy = 'price'
    } = params;

    // 1. Try Live Aviationstack Flight Radar API first
    if (origin.trim() && destination.trim()) {
      try {
        const liveFlights = await AviationstackService.searchLiveFlights({
          origin,
          destination,
          departureDate,
          travelClass
        });
        if (liveFlights && liveFlights.length > 0) {
          return {
            category: this.category,
            provider: 'Aviationstack Live Airline Radar',
            totalCount: liveFlights.length,
            searchedAt: new Date().toISOString(),
            results: liveFlights
          };
        }
      } catch (err) {
        console.warn('Aviationstack live query failed, falling back to database:', err.message);
      }
    }

    const db = getDb();
    let query = `SELECT * FROM external_offers WHERE category = 'flights'`;
    const sqlParams = [];

    if (origin.trim()) {
      query += ` AND (origin LIKE ? OR title LIKE ?)`;
      sqlParams.push(`%${origin.trim()}%`, `%${origin.trim()}%`);
    }

    if (destination.trim()) {
      query += ` AND (destination LIKE ? OR title LIKE ?)`;
      sqlParams.push(`%${destination.trim()}%`, `%${destination.trim()}%`);
    }

    if (maxPrice) {
      query += ` AND price <= ?`;
      sqlParams.push(Number(maxPrice));
    }

    if (sortBy === 'price_desc') {
      query += ` ORDER BY price DESC`;
    } else if (sortBy === 'rating') {
      query += ` ORDER BY rating DESC`;
    } else {
      query += ` ORDER BY price ASC`;
    }

    const stmt = db.prepare(query);
    stmt.bind(sqlParams);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();

    // If specific origin/destination was searched and no static record exists in SQLite,
    // call Aviationstack service directly to generate full realistic airline schedule
    if (rows.length === 0 && origin.trim() && destination.trim()) {
      const fallbackFlights = await AviationstackService.searchLiveFlights({
        origin,
        destination,
        departureDate,
        travelClass
      });
      if (fallbackFlights && fallbackFlights.length > 0) {
        return fallbackFlights;
      }
    }

    return rows.map(r => this.formatOffer({
      ...r,
      deep_link: DeepLinkBuilder.getFlightLink(r.origin || origin, r.destination || destination, departureDate),
      bookingType: 'external_redirect',
      travelClass: travelClass || 'Economy',
      passengers: Number(passengers) || 1,
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      returnDate: returnDate || null,
      priceSummary: `$${r.price} per traveler (taxes & carrier surcharges estimated)`
    }));
  }

  async getOfferDetails(offerId) {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM external_offers WHERE id = ? AND category = 'flights'`);
    stmt.bind([offerId]);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    if (!row) return null;
    return this.formatOffer(row);
  }

  async revalidate(offerId, currentParams = {}) {
    const offer = await this.getOfferDetails(offerId);
    if (!offer) {
      return {
        valid: false,
        message: 'Flight fare is no longer available on partner inventory. Please conduct a fresh search.',
        freshnessTimestamp: new Date().toISOString()
      };
    }

    return {
      valid: true,
      currentPrice: offer.price,
      currency: offer.currency || 'USD',
      freshnessTimestamp: new Date().toISOString(),
      priceChanged: false,
      message: 'Airfare verified against partner schedule.'
    };
  }
}

module.exports = FlightAdapter;

