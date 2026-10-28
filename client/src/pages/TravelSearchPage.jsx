import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { travelAPI } from '../api/client';
import TravelSearchWidget from '../components/travel/TravelSearchWidget';
import ExternalBookingModal from '../components/travel/ExternalBookingModal';

export default function TravelSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = searchParams.get('category') || 'hotels';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedOfferForRedirect, setSelectedOfferForRedirect] = useState(null);

  // Filters & Sorting state
  const [maxPrice, setMaxPrice] = useState(2000);
  const [directOnly, setDirectOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');

  const fetchResults = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const res = await travelAPI.search(params);
      setResults(res.data?.results || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to load travel options. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [searchParams]);

  const handleWidgetSearch = (newCat, newParams) => {
    setSearchParams(newParams);
  };

  // Filter & sort logic
  const filteredResults = results.filter(item => {
    if (directOnly && item.bookingType !== 'direct') return false;
    if (item.price > maxPrice) return false;
    if (minRating > 0 && (item.rating || 0) < minRating) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // recommended
  });

  const getCategoryTitle = () => {
    switch (category) {
      case 'flights': return 'Flights & Airfare';
      case 'hotels': return 'Hotels & Accommodations';
      case 'trains': return 'Railways & Train Routes';
      case 'buses': return 'Intercity Buses & Coaches';
      case 'packages': return 'Holiday & Tour Packages';
      default: return 'Travel Discovery';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'flights': return '✈️';
      case 'hotels': return '🏨';
      case 'trains': return '🚆';
      case 'buses': return '🚌';
      case 'packages': return '🌴';
      default: return '🌍';
    }
  };

  return (
    <div className="container page" style={{ paddingTop: '2rem' }}>
      {/* Top Search Hub */}
      <div style={{ marginBottom: '2.5rem' }}>
        <TravelSearchWidget initialCategory={category} onSearchSubmit={handleWidgetSearch} />
      </div>

      {/* Main Results Layout: Sidebar + Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Filter Sidebar */}
        <aside style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Filters</h3>
            <button
              onClick={() => { setMaxPrice(2000); setDirectOnly(false); setMinRating(0); setSortBy('recommended'); }}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>

          {/* Sort By */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
              Sort Results
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input"
              style={{ width: '100%', borderRadius: '10px', padding: '0.6rem 0.8rem', border: '1px solid #e2e8f0' }}
            >
              <option value="recommended">Recommended & Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Guest Rating</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Max Price</label>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>${maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="2500"
              step="20"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>$20</span>
              <span>$2,500+</span>
            </div>
          </div>

          {/* Direct Booking Only Toggle */}
          <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
              <input
                type="checkbox"
                checked={directOnly}
                onChange={e => setDirectOnly(e.target.checked)}
              />
              TIMS Direct Booking Only
            </label>
            <p style={{ margin: '4px 0 0 24px', fontSize: '0.75rem', color: '#64748b' }}>
              Show only properties & packages bookable directly through TIMS.
            </p>
          </div>

          {/* Rating Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
              Minimum Rating
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Any Rating', val: 0 },
                { label: '★ 4.5 & Above (Exceptional)', val: 4.5 },
                { label: '★ 4.0 & Above (Very Good)', val: 4.0 },
                { label: '★ 3.5 & Above (Good)', val: 3.5 },
              ].map(r => (
                <label key={r.val} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === r.val}
                    onChange={() => setMinRating(r.val)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Main Section */}
        <main>
          {/* Summary Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.5rem' }}>{getCategoryIcon()}</span>
                <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', margin: 0, color: '#0f172a' }}>
                  {getCategoryTitle()}
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                Showing {filteredResults.length} matching offer{filteredResults.length === 1 ? '' : 's'} · Verified partner network
              </p>
            </div>

            {/* Freshness Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              color: '#166534',
              fontWeight: 600
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              Live Price & Availability Engine Active
            </div>
          </div>

          {/* Special Train / Bus Disclaimer banner if relevant */}
          {(category === 'trains' || category === 'buses') && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🛡️</span>
              <div style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.5 }}>
                <strong>Authorized Schedule & Ticket Policy:</strong> TIMS displays official timetable schedules. In compliance with railway and passenger transport safety regulations, final ticket issuance and confirmed PNR reservations are fulfilled directly through official authorized portals (IRCTC & RedBus partner networks).
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="splash-bar mx-auto" style={{ width: '120px' }}>
                <div className="splash-bar-inner"></div>
              </div>
              <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.95rem' }}>
                Scanning certified airline, hotel, and operator inventories...
              </p>
            </div>
          )}

          {/* Error State */}
          {errorMsg && !loading && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              color: '#dc2626'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Search Error</h3>
              <p style={{ margin: '0 0 1rem 0' }}>{errorMsg}</p>
              <button onClick={fetchResults} className="btn btn-primary">Try Again</button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !errorMsg && filteredResults.length === 0 && (
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '4rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
                No travel offers matched your criteria
              </h3>
              <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                Try adjusting your price range, clearing specific filters, or searching for a nearby airport/station.
              </p>
              <button
                onClick={() => { setMaxPrice(2000); setDirectOnly(false); setMinRating(0); }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Results Grid / List */}
          {!loading && !errorMsg && filteredResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredResults.map(item => {
                const isDirect = item.bookingType === 'direct';
                const providerBadge = isDirect
                  ? { label: 'TIMS Direct Booking', bg: '#dcfce7', text: '#15803d' }
                  : { label: `${item.provider_code || item.providerCode || 'PARTNER'} Verified`, bg: '#e0f2fe', text: '#0369a1' };

                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'row',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {/* Item Image */}
                    {item.image_url && (
                      <div style={{ width: '240px', minWidth: '240px', position: 'relative' }}>
                        <img
                          src={item.image_url}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                          onError={e => { e.currentTarget.src = '/forest-bg.jpg'; }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: providerBadge.bg,
                          color: providerBadge.text,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {providerBadge.label}
                        </div>
                      </div>
                    )}

                    {/* Content Details */}
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Rating & Location / Operator */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                            {item.operator_or_airline || item.destination || 'Travel Service'}
                          </span>
                          {item.rating && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}>
                              ★ {item.rating}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
                          {item.title}
                        </h3>

                        {/* Times / Route / Class Details */}
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.88rem', color: '#334155', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          {item.departure_time && (
                            <div>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>DEPARTURE</span>
                              <strong>{item.departure_time}</strong>
                            </div>
                          )}
                          {item.duration && (
                            <div>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>DURATION</span>
                              <strong>{item.duration}</strong>
                            </div>
                          )}
                          {item.arrival_time && (
                            <div>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>ARRIVAL</span>
                              <strong>{item.arrival_time}</strong>
                            </div>
                          )}
                          {item.stops_or_class && (
                            <div>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>CLASS / STOPS</span>
                              <strong style={{ color: '#2563eb' }}>{item.stops_or_class}</strong>
                            </div>
                          )}
                        </div>

                        {/* Amenities / Highlights */}
                        {item.amenities_or_terms && (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                            {item.amenities_or_terms}
                          </p>
                        )}
                      </div>

                      {/* Footer: Price + Action Button */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: '1.25rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                            {item.is_estimated ? 'Estimated Rate' : 'Confirmed Rate'}
                          </div>
                          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                            ${item.price}
                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b', marginLeft: '4px' }}>
                              / {item.price_basis ? item.price_basis.replace('_', ' ') : 'trip'}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isDirect ? (
                            <Link
                              to={item.category === 'packages' ? `/book/${item.rawId}` : `/book/hotel/${item.rawId}`}
                              className="btn btn-primary"
                              style={{ borderRadius: '12px', padding: '0.65rem 1.4rem', fontWeight: 700 }}
                            >
                              Book on TIMS ⚡
                            </Link>
                          ) : (
                            <button
                              onClick={() => setSelectedOfferForRedirect(item)}
                              className="btn"
                              style={{
                                background: '#f8fafc',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                borderRadius: '12px',
                                padding: '0.65rem 1.4rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Book on Partner ↗
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* External Booking Modal */}
      {selectedOfferForRedirect && (
        <ExternalBookingModal
          offer={selectedOfferForRedirect}
          onClose={() => setSelectedOfferForRedirect(null)}
        />
      )}
    </div>
  );
}

