import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconHotel,
  IconFlight,
  IconTrain,
  IconBus,
  IconHolidayPackage,
  IconWarning,
  IconSearch
} from '../ui/Icons';

const TABS = [
  { id: 'hotels', label: 'Hotels & Stays', Icon: IconHotel },
  { id: 'flights', label: 'Flights', Icon: IconFlight },
  { id: 'trains', label: 'Trains', Icon: IconTrain },
  { id: 'buses', label: 'Buses', Icon: IconBus },
  { id: 'packages', label: 'Holiday Packages', Icon: IconHolidayPackage },
];

export default function TravelSearchWidget({ initialCategory = 'hotels', onSearchSubmit }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [validationError, setValidationError] = useState(null);

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Search States
  const [flightData, setFlightData] = useState({
    tripType: 'one_way',
    origin: 'New York (JFK)',
    destination: 'Paris (CDG)',
    departureDate: today,
    returnDate: tomorrow,
    passengers: 1,
    travelClass: 'Economy'
  });

  const [hotelData, setHotelData] = useState({
    destination: 'Paris',
    checkIn: today,
    checkOut: tomorrow,
    guests: 2,
    rooms: 1
  });

  const [trainData, setTrainData] = useState({
    origin: 'New Delhi (NDLS)',
    destination: 'Varanasi Junction (BSB)',
    journeyDate: today,
    trainClass: 'All Classes',
    quota: 'General'
  });

  const [busData, setBusData] = useState({
    origin: 'Bengaluru',
    destination: 'Goa',
    departureDate: today,
    busType: 'All Types'
  });

  const [packageData, setPackageData] = useState({
    destination: 'Bali',
    origin: 'Mumbai',
    travelers: 2,
    durationDays: '7',
    maxPrice: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setValidationError(null);

    let queryParams = new URLSearchParams();
    queryParams.set('category', activeTab);

    if (activeTab === 'flights') {
      if (!flightData.origin.trim() || !flightData.destination.trim()) {
        return setValidationError('Please specify both departure and destination airports.');
      }
      if (flightData.origin.trim().toLowerCase() === flightData.destination.trim().toLowerCase()) {
        return setValidationError('Departure and destination cities cannot be identical.');
      }
      if (flightData.tripType === 'round_trip' && flightData.returnDate < flightData.departureDate) {
        return setValidationError('Return date must be on or after departure date.');
      }
      queryParams.set('origin', flightData.origin);
      queryParams.set('destination', flightData.destination);
      queryParams.set('departureDate', flightData.departureDate);
      if (flightData.tripType === 'round_trip') queryParams.set('returnDate', flightData.returnDate);
      queryParams.set('passengers', flightData.passengers);
      queryParams.set('travelClass', flightData.travelClass);
    } else if (activeTab === 'hotels') {
      if (!hotelData.destination.trim()) {
        return setValidationError('Please enter a destination city or hotel name.');
      }
      if (hotelData.checkOut <= hotelData.checkIn) {
        return setValidationError('Check-out date must be after check-in date.');
      }
      queryParams.set('destination', hotelData.destination);
      queryParams.set('checkIn', hotelData.checkIn);
      queryParams.set('checkOut', hotelData.checkOut);
      queryParams.set('guests', hotelData.guests);
      queryParams.set('rooms', hotelData.rooms);
    } else if (activeTab === 'trains') {
      if (!trainData.origin.trim() || !trainData.destination.trim()) {
        return setValidationError('Please enter both origin and destination railway stations.');
      }
      queryParams.set('origin', trainData.origin);
      queryParams.set('destination', trainData.destination);
      queryParams.set('journeyDate', trainData.journeyDate);
      queryParams.set('trainClass', trainData.trainClass);
      queryParams.set('quota', trainData.quota);
    } else if (activeTab === 'buses') {
      if (!busData.origin.trim() || !busData.destination.trim()) {
        return setValidationError('Please enter both origin and destination cities for your bus trip.');
      }
      queryParams.set('origin', busData.origin);
      queryParams.set('destination', busData.destination);
      queryParams.set('departureDate', busData.departureDate);
      queryParams.set('busType', busData.busType);
    } else if (activeTab === 'packages') {
      if (!packageData.destination.trim()) {
        return setValidationError('Please enter a target holiday destination.');
      }
      queryParams.set('destination', packageData.destination);
      queryParams.set('origin', packageData.origin);
      queryParams.set('travelers', packageData.travelers);
      if (packageData.durationDays) queryParams.set('durationDays', packageData.durationDays);
      if (packageData.maxPrice) queryParams.set('maxPrice', packageData.maxPrice);
    }

    if (onSearchSubmit) {
      onSearchSubmit(activeTab, Object.fromEntries(queryParams));
    } else {
      navigate(`/search?${queryParams.toString()}`);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
      padding: '1.75rem',
      maxWidth: '1100px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 20
    }}>
      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        {TABS.map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setValidationError(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.15rem',
                borderRadius: '9999px',
                border: 'none',
                background: isSelected ? '#eff6ff' : 'transparent',
                color: isSelected ? '#1d4ed8' : '#475569',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span><tab.Icon size={20} /></span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {validationError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '0.65rem 1rem',
          borderRadius: '12px',
          fontSize: '0.88rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <IconWarning size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSearch}>
        {/* 1. HOTELS FORM */}
        {activeTab === 'hotels' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>City, Property or Location</label>
              <input
                type="text"
                placeholder="e.g. Paris, Goa, Dubai"
                value={hotelData.destination}
                onChange={e => setHotelData({ ...hotelData, destination: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Check-In Date</label>
              <input
                type="date"
                min={today}
                value={hotelData.checkIn}
                onChange={e => setHotelData({ ...hotelData, checkIn: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Check-Out Date</label>
              <input
                type="date"
                min={hotelData.checkIn || today}
                value={hotelData.checkOut}
                onChange={e => setHotelData({ ...hotelData, checkOut: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Rooms & Guests</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={hotelData.rooms}
                  onChange={e => setHotelData({ ...hotelData, rooms: Number(e.target.value) })}
                  className="input"
                  style={{ borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0', flex: 1 }}
                >
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Room{r > 1 ? 's' : ''}</option>)}
                </select>
                <select
                  value={hotelData.guests}
                  onChange={e => setHotelData({ ...hotelData, guests: Number(e.target.value) })}
                  className="input"
                  style={{ borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0', flex: 1 }}
                >
                  {[1, 2, 3, 4, 6, 8, 10].map(g => <option key={g} value={g}>{g} Guest{g > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconHotel size={18} />
                <span>Search Stays</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. FLIGHTS FORM */}
        {activeTab === 'flights' && (
          <div>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="tripType"
                  value="one_way"
                  checked={flightData.tripType === 'one_way'}
                  onChange={() => setFlightData({ ...flightData, tripType: 'one_way' })}
                />
                One Way
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="tripType"
                  value="round_trip"
                  checked={flightData.tripType === 'round_trip'}
                  onChange={() => setFlightData({ ...flightData, tripType: 'round_trip' })}
                />
                Round Trip
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>From (Airport / City)</label>
                <input
                  type="text"
                  placeholder="e.g. New York (JFK), London"
                  value={flightData.origin}
                  onChange={e => setFlightData({ ...flightData, origin: e.target.value })}
                  className="input"
                  style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>To (Destination)</label>
                <input
                  type="text"
                  placeholder="e.g. Paris (CDG), Dubai"
                  value={flightData.destination}
                  onChange={e => setFlightData({ ...flightData, destination: e.target.value })}
                  className="input"
                  style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Departure Date</label>
                <input
                  type="date"
                  min={today}
                  value={flightData.departureDate}
                  onChange={e => setFlightData({ ...flightData, departureDate: e.target.value })}
                  className="input"
                  style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0' }}
                />
              </div>
              {flightData.tripType === 'round_trip' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Return Date</label>
                  <input
                    type="date"
                    min={flightData.departureDate || today}
                    value={flightData.returnDate}
                    onChange={e => setFlightData({ ...flightData, returnDate: e.target.value })}
                    className="input"
                    style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0' }}
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Class & Travelers</label>
                <select
                  value={flightData.travelClass}
                  onChange={e => setFlightData({ ...flightData, travelClass: e.target.value })}
                  className="input"
                  style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0' }}
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business Class</option>
                  <option value="First">First Class</option>
                </select>
              </div>
              <div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <IconFlight size={18} />
                  <span>Search Flights</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. TRAINS FORM */}
        {activeTab === 'trains' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>From Station</label>
              <input
                type="text"
                placeholder="e.g. New Delhi (NDLS), Mumbai"
                value={trainData.origin}
                onChange={e => setTrainData({ ...trainData, origin: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>To Station</label>
              <input
                type="text"
                placeholder="e.g. Varanasi (BSB), Howrah"
                value={trainData.destination}
                onChange={e => setTrainData({ ...trainData, destination: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Travel Date</label>
              <input
                type="date"
                min={today}
                value={trainData.journeyDate}
                onChange={e => setTrainData({ ...trainData, journeyDate: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Class & Quota</label>
              <select
                value={trainData.trainClass}
                onChange={e => setTrainData({ ...trainData, trainClass: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0' }}
              >
                <option value="All Classes">All Classes</option>
                <option value="Executive Chair Car (EC)">Executive (EC / Vande Bharat)</option>
                <option value="AC 1st Class (1A)">AC 1st Class (1A)</option>
                <option value="AC 2 Tier (2A)">AC 2 Tier (2A)</option>
                <option value="AC 3 Tier (3A)">AC 3 Tier (3A)</option>
                <option value="Sleeper (SL)">Sleeper (SL)</option>
              </select>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconTrain size={18} />
                <span>Find Trains</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. BUSES FORM */}
        {activeTab === 'buses' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Origin City</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Delhi, Mumbai"
                value={busData.origin}
                onChange={e => setBusData({ ...busData, origin: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Destination City</label>
              <input
                type="text"
                placeholder="e.g. Goa, Manali, Jaipur"
                value={busData.destination}
                onChange={e => setBusData({ ...busData, destination: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Departure Date</label>
              <input
                type="date"
                min={today}
                value={busData.departureDate}
                onChange={e => setBusData({ ...busData, departureDate: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Coach / Seat Preference</label>
              <select
                value={busData.busType}
                onChange={e => setBusData({ ...busData, busType: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0' }}
              >
                <option value="All Types">All Coaches</option>
                <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                <option value="Multi-Axle Volvo AC">Multi-Axle Volvo AC</option>
                <option value="AC Semi-Sleeper">AC Semi-Sleeper</option>
                <option value="Non-AC Seater">Non-AC Seater</option>
              </select>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconBus size={18} />
                <span>Find Buses</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. HOLIDAY PACKAGES FORM */}
        {activeTab === 'packages' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Destination</label>
              <input
                type="text"
                placeholder="e.g. Bali, Switzerland, Paris"
                value={packageData.destination}
                onChange={e => setPackageData({ ...packageData, destination: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Departing From</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, New York"
                value={packageData.origin}
                onChange={e => setPackageData({ ...packageData, origin: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Max Duration (Days)</label>
              <select
                value={packageData.durationDays}
                onChange={e => setPackageData({ ...packageData, durationDays: e.target.value })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0' }}
              >
                <option value="3">Weekend (3-4 Days)</option>
                <option value="7">1 Week (5-7 Days)</option>
                <option value="14">Extended (10-14 Days)</option>
                <option value="">Any Duration</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Travelers</label>
              <select
                value={packageData.travelers}
                onChange={e => setPackageData({ ...packageData, travelers: Number(e.target.value) })}
                className="input"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', border: '1px solid #e2e8f0' }}
              >
                {[1, 2, 3, 4, 5, 8, 10].map(n => <option key={n} value={n}>{n} Traveler{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconHolidayPackage size={18} />
                <span>Explore Tours</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

