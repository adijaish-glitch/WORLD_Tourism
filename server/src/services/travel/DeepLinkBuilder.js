/**
 * DeepLinkBuilder - Constructs direct pre-filled search URLs for external travel providers.
 * Eliminates generic blank homepages by injecting origin, destination, and dates into partner query strings.
 */

const AIRPORT_CODES = {
  delhi: 'DEL', 'new delhi': 'DEL',
  mumbai: 'BOM',
  bengaluru: 'BLR', bangalore: 'BLR',
  kolkata: 'CCU',
  chennai: 'MAA',
  hyderabad: 'HYD',
  goa: 'GOI',
  jaipur: 'JAI',
  manali: 'KUU', kullu: 'KUU',
  srinagar: 'SXR',
  varanasi: 'VNS',
  kochi: 'COK', kerala: 'COK',
  agra: 'AGR',
  udaipur: 'UDR',
  rishikesh: 'DED', dehradun: 'DED',
  amritsar: 'ATQ',
  pune: 'PNQ',
  ahmedabad: 'AMD',
  ladakh: 'IXL', leh: 'IXL',
  shimla: 'SLV',
  'new york': 'JFK', jfk: 'JFK', nyc: 'JFK',
  paris: 'CDG', cdg: 'CDG',
  london: 'LHR', lhr: 'LHR',
  dubai: 'DXB', dxb: 'DXB',
  singapore: 'SIN', sin: 'SIN',
  tokyo: 'HND', hnd: 'HND',
  bangkok: 'BKK', bkk: 'BKK'
};

const slugify = (text) => (text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const extractCode = (str) => {
  const match = (str || '').match(/\(([A-Z]{3})\)/i);
  return match ? match[1].toUpperCase() : null;
};

const cleanCity = (str) => {
  return (str || '').replace(/\([A-Z0-9\s]+\)/gi, '').trim();
};

const getAirportCode = (city) => {
  const explicit = extractCode(city);
  if (explicit) return explicit;
  const clean = cleanCity(city).toLowerCase().trim();
  for (const [key, val] of Object.entries(AIRPORT_CODES)) {
    if (clean.includes(key)) return val;
  }
  return 'DEL';
};

class DeepLinkBuilder {
  static getFlightLink(origin, destination, date) {
    const fromClean = cleanCity(origin) || 'Delhi';
    const toClean = cleanCity(destination) || 'Goa';
    const travelDate = date || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

    // Google Flights opens immediately with live airlines, schedules, and real-time prices for this exact route
    return `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(fromClean)}+to+${encodeURIComponent(toClean)}+on+${travelDate}`;
  }

  static getTrainLink(origin, destination, date) {
    const fromSlug = slugify(cleanCity(origin) || 'delhi');
    const toSlug = slugify(cleanCity(destination) || 'varanasi');
    
    // ConfirmTkt directly shows train availability, waitlist prediction, and Tatkal status for the station pair
    return `https://www.confirmtkt.com/trains/${fromSlug}-to-${toSlug}`;
  }

  static getBusLink(origin, destination, date) {
    const fromSlug = slugify(cleanCity(origin) || 'bengaluru');
    const toSlug = slugify(cleanCity(destination) || 'goa');

    // RedBus direct seat layout and coach booking route
    return `https://www.redbus.in/bus-tickets/${fromSlug}-to-${toSlug}`;
  }

  static getHotelLink(destination, checkInDate) {
    const toClean = cleanCity(destination) || 'Goa';
    const travelDate = checkInDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

    // Booking.com direct pre-filtered property results
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(toClean)}&checkin=${travelDate}`;
  }

  static getPackageLink(destination) {
    const toSlug = slugify(cleanCity(destination) || 'goa');
    return `https://www.makemytrip.com/holidays-india/${toSlug}-travel-packages.html`;
  }
}

module.exports = DeepLinkBuilder;
