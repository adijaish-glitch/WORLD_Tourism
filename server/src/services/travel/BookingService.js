const https = require('https');

class BookingService {
  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || 'c6cb904093msh05fbcc2989e1eecp12eba4jsn1d04ab82767c';
    this.host = 'apidojo-booking-v1.p.rapidapi.com';
    this.cache = new Map();
    this.locationCache = new Map();
    this.CACHE_TTL = 15 * 60 * 1000; // 15 mins
  }

  formatDate(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }

  getDefaultDates(checkIn, checkOut) {
    const today = new Date();
    
    let arrivalDate = this.formatDate(checkIn);
    if (!arrivalDate) {
      const arr = new Date(today);
      arr.setDate(arr.getDate() + 7);
      arrivalDate = arr.toISOString().split('T')[0];
    }

    let departureDate = this.formatDate(checkOut);
    if (!departureDate) {
      const dep = new Date(arrivalDate);
      dep.setDate(dep.getDate() + 2);
      departureDate = dep.toISOString().split('T')[0];
    }

    return { arrivalDate, departureDate };
  }

  async resolveDestId(destination) {
    const term = destination.trim().toLowerCase();
    if (this.locationCache.has(term)) {
      return this.locationCache.get(term);
    }

    // Common city fast-lookups
    const fastMap = {
      'delhi': '-2106102',
      'new delhi': '-2106102',
      'mumbai': '-2092174',
      'gwalior': '-2096472',
      'bengaluru': '-2090186',
      'bangalore': '-2090186',
      'jaipur': '-2097701',
      'agra': '-2088019',
      'london': '-2601889',
      'paris': '-1456928',
      'new york': '20088325',
      'dubai': '-553173'
    };

    if (fastMap[term]) {
      this.locationCache.set(term, fastMap[term]);
      return fastMap[term];
    }

    // Auto-complete API
    try {
      const res = await this.makeRequest(`/locations/auto-complete?text=${encodeURIComponent(destination)}&languagecode=en-us`);
      if (Array.isArray(res) && res.length > 0) {
        const match = res.find(loc => loc.dest_type === 'city' || loc.dest_id) || res[0];
        if (match && match.dest_id) {
          this.locationCache.set(term, String(match.dest_id));
          return String(match.dest_id);
        }
      }
    } catch (err) {
      console.warn(`[BookingService] Location auto-complete error for "${destination}":`, err.message);
    }

    return '-2106102'; // Default fallback to Delhi
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.host,
        path: path,
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.host,
          'Accept': 'application/json'
        },
        timeout: 8000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(new Error(`Failed to parse Booking response: ${e.message}`));
            }
          } else {
            reject(new Error(`Booking API HTTP ${res.statusCode}: ${body.slice(0, 150)}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Booking.com API request timed out'));
      });
      req.end();
    });
  }

  async searchHotels(destination = 'Delhi', checkIn = '', checkOut = '', guests = 2) {
    const destId = await this.resolveDestId(destination);
    const { arrivalDate, departureDate } = this.getDefaultDates(checkIn, checkOut);
    const guestQty = Math.max(1, Number(guests) || 1);

    const cacheKey = `${destId}_${arrivalDate}_${departureDate}_${guestQty}`;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      return cached.data;
    }

    const path = `/properties/v2/list?dest_ids=${destId}&arrival_date=${arrivalDate}&departure_date=${departureDate}&guest_qty=${guestQty}&offset=0&search_type=city`;

    try {
      const data = await this.makeRequest(path);
      const results = [];

      if (data && Array.isArray(data.result)) {
        for (const item of data.result) {
          if (item.type !== 'property_card') continue;

          const name = item.hotel_name || item.hotel_name_trans || 'Luxury Property';
          const perNightUSD = item.composite_price_breakdown?.gross_amount_per_night?.value 
            || (item.min_total_price ? Math.round(item.min_total_price / 2) : 65);
          const perNightFormatted = item.composite_price_breakdown?.gross_amount_per_night?.amount_rounded || `$${Math.round(perNightUSD)}`;
          const localCurrencyObj = item.composite_price_breakdown?.gross_amount_hotel_currency;

          // Convert 10-point scale to 5-star scale
          const rawScore = Number(item.review_score) || 8.0;
          const starsRating = Number((rawScore / 2).toFixed(1));

          // Clean high-res photo URL
          let photoUrl = item.main_photo_url || '';
          if (photoUrl) {
            photoUrl = photoUrl.replace('square60', 'max500');
          } else {
            photoUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
          }

          const distText = item.distances?.[0]?.text ? ` • ${item.distances[0].text}` : '';
          const scoreWord = item.review_score_word ? `${item.review_score_word} (${rawScore}/10)` : `${rawScore}/10 on Booking.com`;

          results.push({
            id: `booking-live-${item.hotel_id || item.id}`,
            rawId: item.hotel_id || item.id,
            provider_code: 'BOOKING_COM_LIVE',
            category: 'hotels',
            title: name,
            destination: item.city || destination,
            price: Math.round(perNightUSD),
            currency: 'USD',
            price_basis: 'per_night',
            is_estimated: 0,
            supports_direct_booking: 0,
            bookingType: 'external_redirect',
            deep_link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&checkin=${arrivalDate}&checkout=${departureDate}`,
            rating: starsRating,
            image_url: photoUrl,
            operator_or_airline: 'Booking.com Verified Partner',
            stops_or_class: `${item.accommodation_type_name || 'Hotel'} • ${scoreWord}`,
            amenities_or_terms: `${item.review_nr || 50}+ guest reviews${distText}${localCurrencyObj ? ` • Approx ${localCurrencyObj.amount_rounded}` : ''}`,
            checkIn: arrivalDate,
            checkOut: departureDate,
            source: 'Booking.com Live API'
          });
        }
      }

      this.cache.set(cacheKey, { timestamp: Date.now(), data: results });
      return results;
    } catch (err) {
      console.error('[BookingService] Failed to fetch live hotels:', err.message);
      return [];
    }
  }
}

module.exports = new BookingService();

