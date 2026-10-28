const FlightAdapter = require('../services/travel/FlightAdapter');
const HotelAdapter = require('../services/travel/HotelAdapter');
const TrainAdapter = require('../services/travel/TrainAdapter');
const BusAdapter = require('../services/travel/BusAdapter');
const PackageAdapter = require('../services/travel/PackageAdapter');
const ExternalRedirectService = require('../services/travel/ExternalRedirectService');
const AuditService = require('../services/auditService');
const { getDb, saveDb } = require('../db/connection');

const adapters = {
  flights: new FlightAdapter(),
  hotels: new HotelAdapter(),
  trains: new TrainAdapter(),
  buses: new BusAdapter(),
  packages: new PackageAdapter()
};

/**
 * Universal Multi-Modal Travel Search
 */
exports.search = async (req, res, next) => {
  try {
    const { category = 'hotels', ...params } = req.query;
    const cat = category.toLowerCase().trim();

    if (!adapters[cat]) {
      return res.status(400).json({
        error: `Invalid travel category '${category}'. Supported categories: ${Object.keys(adapters).join(', ')}.`
      });
    }

    const results = await adapters[cat].search(params);

    res.json({
      category: cat,
      provider: adapters[cat].name,
      totalCount: results.length,
      searchedAt: new Date().toISOString(),
      results
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Revalidate price, inventory, and offer freshness
 */
exports.revalidate = async (req, res, next) => {
  try {
    const { category, offerId, price } = req.query;
    const cat = (category || '').toLowerCase().trim();

    if (!cat || !adapters[cat]) {
      return res.status(400).json({ error: 'Valid travel category required for revalidation.' });
    }

    if (!offerId) {
      return res.status(400).json({ error: 'offerId is required.' });
    }

    const validationResult = await adapters[cat].revalidate(offerId, { price: Number(price) || null });
    res.json(validationResult);
  } catch (err) {
    next(err);
  }
};

/**
 * Safe External Partner Redirect with Open-Redirect Protection
 */
exports.generateRedirect = (req, res) => {
  try {
    const { targetUrl, providerCode, category } = req.body;
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';

    const redirectInfo = ExternalRedirectService.buildSafeRedirect(targetUrl, {
      providerName: providerCode,
      category,
      affiliateId: req.body.affiliateId || null
    });

    // Audit log the outbound departure
    AuditService.log({
      userId,
      action: 'EXTERNAL_TRAVEL_REDIRECT',
      ipAddress,
      details: {
        targetHost: redirectInfo.targetHost,
        providerCode,
        category
      }
    });

    res.json({
      success: true,
      ...redirectInfo
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || 'Unauthorized redirect URL'
    });
  }
};

/**
 * List Authorized Travel Providers
 */
exports.listProviders = (req, res) => {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM travel_providers WHERE is_active = 1 ORDER BY id ASC');
  const providers = [];
  while (stmt.step()) providers.push(stmt.getAsObject());
  stmt.free();
  res.json({ providers });
};

/**
 * Retrieve Audit Logs (Admin only)
 */
exports.getAuditLogs = (req, res) => {
  const { limit = 50 } = req.query;
  const logs = AuditService.getRecentLogs(limit);
  res.json({ logs });
};

/**
 * Admin: Add New External / Hybrid Offer
 */
exports.createOffer = (req, res) => {
  const {
    provider_code, category, title, origin, destination, price, currency = 'USD',
    price_basis = 'per_person', is_estimated = 1, deep_link, rating = 4.5,
    image_url, operator_or_airline, departure_time, arrival_time, duration,
    stops_or_class, amenities_or_terms
  } = req.body;

  if (!title || !destination || !price || !deep_link) {
    return res.status(400).json({ error: 'Title, destination, price, and deep_link are required.' });
  }

  // Validate the deep link domain before saving
  const check = ExternalRedirectService.validateUrl(deep_link);
  if (!check.safe) {
    return res.status(400).json({ error: `Invalid deep_link: ${check.error}` });
  }

  const db = getDb();
  db.run(`
    INSERT INTO external_offers
    (provider_code, category, title, origin, destination, price, currency, price_basis, is_estimated, deep_link, rating, image_url, operator_or_airline, departure_time, arrival_time, duration, stops_or_class, amenities_or_terms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [provider_code || 'MAKEMYTRIP', category || 'hotels', title, origin || null, destination, price, currency, price_basis, is_estimated ? 1 : 0, deep_link, rating, image_url, operator_or_airline, departure_time, arrival_time, duration, stops_or_class, amenities_or_terms]);
  saveDb();

  AuditService.log({
    userId: req.user.id,
    action: 'CREATE_TRAVEL_OFFER',
    ipAddress: req.ip,
    details: { title, category, destination, price }
  });

  res.status(201).json({ message: 'Travel discovery offer created successfully.' });
};

/**
 * Admin: Update Offer
 */
exports.updateOffer = (req, res) => {
  const { id } = req.params;
  const {
    provider_code, category, title, origin, destination, price, currency,
    price_basis, is_estimated, deep_link, rating, image_url, operator_or_airline,
    departure_time, arrival_time, duration, stops_or_class, amenities_or_terms
  } = req.body;

  if (deep_link) {
    const check = ExternalRedirectService.validateUrl(deep_link);
    if (!check.safe) return res.status(400).json({ error: `Invalid deep_link: ${check.error}` });
  }

  const db = getDb();
  db.run(`
    UPDATE external_offers SET
      provider_code = COALESCE(?, provider_code),
      category = COALESCE(?, category),
      title = COALESCE(?, title),
      origin = COALESCE(?, origin),
      destination = COALESCE(?, destination),
      price = COALESCE(?, price),
      currency = COALESCE(?, currency),
      price_basis = COALESCE(?, price_basis),
      is_estimated = COALESCE(?, is_estimated),
      deep_link = COALESCE(?, deep_link),
      rating = COALESCE(?, rating),
      image_url = COALESCE(?, image_url),
      operator_or_airline = COALESCE(?, operator_or_airline),
      departure_time = COALESCE(?, departure_time),
      arrival_time = COALESCE(?, arrival_time),
      duration = COALESCE(?, duration),
      stops_or_class = COALESCE(?, stops_or_class),
      amenities_or_terms = COALESCE(?, amenities_or_terms),
      last_updated = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [provider_code, category, title, origin, destination, price, currency, price_basis, is_estimated, deep_link, rating, image_url, operator_or_airline, departure_time, arrival_time, duration, stops_or_class, amenities_or_terms, id]);
  saveDb();

  res.json({ message: 'Offer updated successfully.' });
};

/**
 * Admin: Delete Offer
 */
exports.deleteOffer = (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.run('DELETE FROM external_offers WHERE id = ?', [id]);
  saveDb();
  res.json({ message: 'Offer deleted successfully.' });
};

