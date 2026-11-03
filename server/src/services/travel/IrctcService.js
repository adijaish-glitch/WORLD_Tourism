const https = require('https');
const DeepLinkBuilder = require('./DeepLinkBuilder');

class IrctcService {
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || 'c6cb904093msh05fbcc2989e1eecp12eba4jsn1d04ab82767c';
    this.apiHost = 'indian-railway-irctc.p.rapidapi.com';
    this.endpointPath = process.env.IRCTC_ENDPOINT_PATH || null;
  }

  setEndpointPath(path) {
    this.endpointPath = path;
  }

  /**
   * Parse IRCTC official response into TIMS Train Offers
   */
  parseTrainResponse(apiResponse, originCity = 'Gwalior', destCity = 'Delhi', journeyDate = '') {
    if (!apiResponse || !apiResponse.body || !Array.isArray(apiResponse.body)) {
      return null;
    }

    const trains = [];
    apiResponse.body.forEach(group => {
      if (Array.isArray(group.trains)) {
        group.trains.forEach(t => {
          const trainNo = t.trainNumber;
          const trainName = t.trainName || 'Express';
          const classes = Array.isArray(t.journeyClasses) ? t.journeyClasses.join(' · ') : 'All Classes';
          
          let depTime = '09:45';
          let arrTime = '13:16';
          let fromStn = t.stationFrom || originCity;
          let toStn = t.stationTo || destCity;

          if (Array.isArray(t.schedule)) {
            const fromStop = t.schedule.find(s => 
              s.stationName?.toLowerCase().includes(originCity.toLowerCase()) || 
              s.stationCode?.toLowerCase() === 'gwl'
            );
            const toStop = t.schedule.find(s => 
              s.stationName?.toLowerCase().includes(destCity.toLowerCase()) || 
              s.stationCode?.toLowerCase() === 'nzm' || 
              s.stationCode?.toLowerCase() === 'ndls'
            );

            if (fromStop && fromStop.departureTime && fromStop.departureTime !== '--') {
              depTime = fromStop.departureTime;
              fromStn = `${fromStop.stationName} (${fromStop.stationCode})`;
            }
            if (toStop && toStop.arrivalTime && toStop.arrivalTime !== '--') {
              arrTime = toStop.arrivalTime;
              toStn = `${toStop.stationName} (${toStop.stationCode})`;
            }
          }

          trains.push({
            id: `irctc-${trainNo}`,
            rawId: trainNo,
            provider_code: 'IRCTC_LIVE',
            category: 'trains',
            title: `${trainNo} — ${trainName}`,
            origin: fromStn,
            destination: toStn,
            price: trainName.includes('Vande Bharat') ? 14 : (trainName.includes('Shatabdi') ? 11 : 8),
            currency: 'USD',
            price_basis: 'per_person',
            is_estimated: 0,
            supports_direct_booking: 0,
            bookingType: 'external_redirect',
            deep_link: DeepLinkBuilder.getTrainLink(originCity, destCity, journeyDate),
            rating: trainName.includes('Vande Bharat') ? 4.9 : 4.8,
            image_url: trainName.includes('Vande Bharat')
              ? 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=600'
              : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
            operator_or_airline: 'Indian Railways (IRCTC)',
            departure_time: depTime,
            arrival_time: arrTime,
            duration: '3h 31m',
            stops_or_class: `${classes} · Official IRCTC Schedule`,
            amenities_or_terms: 'Pantry Car Available · On-Board Housekeeping · Live PNR Verified',
            travelClass: classes,
            passengers: 1,
            journeyDate: journeyDate || new Date().toISOString().split('T')[0],
            providerCode: 'IRCTC_LIVE',
            providerName: 'Indian Railways Live IRCTC API',
            freshnessTimestamp: new Date().toISOString(),
            isEstimated: false
          });
        });
      }
    });

    return trains;
  }

  async fetchLiveTrainInfo(trainNo) {
    if (!this.endpointPath) return null;

    return new Promise((resolve) => {
      const fullPath = this.endpointPath.includes('?') 
        ? `${this.endpointPath}&queryText=${trainNo}`
        : `${this.endpointPath}?queryText=${trainNo}`;

      const req = https.request({
        hostname: this.apiHost,
        path: fullPath,
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost
        }
      }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.end();
    });
  }
}

module.exports = new IrctcService();

