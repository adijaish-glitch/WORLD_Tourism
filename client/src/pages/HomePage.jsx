import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TravelSearchWidget from '../components/travel/TravelSearchWidget';
import { packagesAPI, hotelsAPI } from '../api/client';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      packagesAPI.list({ limit: 4 }).catch(() => ({ data: { packages: [] } })),
      hotelsAPI.list({ limit: 4 }).catch(() => ({ data: { hotels: [] } }))
    ]).then(([pkgRes, hotelRes]) => {
      setFeaturedPackages(pkgRes.data?.packages || []);
      setFeaturedHotels(hotelRes.data?.hotels || []);
      setLoadingData(false);
    });
  }, []);

  const fallbackImg = '/forest-bg.jpg';

  return (
    <>
      <div className="hero" style={{ paddingBottom: '3rem' }}>
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="badge-pill">
            MakeMyTrip Inspired Travel Hub · 500+ Destinations & Routes ✈️
          </div>
        </div>

        {/* Hero Headline */}
        <h1 className="hero-title mb-6">
          Discover the world's most <br />
          <span className="italic">Breathtaking Journeys</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle mb-8">
          Search hotels, book flights, check train schedules, and reserve curated holiday packages—all in one seamless, secure discovery platform.
        </p>

        {/* MakeMyTrip-Inspired Universal Travel Search Hub */}
        <div style={{ width: '100%', marginBottom: '3.5rem' }}>
          <TravelSearchWidget />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-4 flex-wrap" style={{ marginBottom: '3rem' }}>
          <Link to="/packages" className="btn btn-primary">
            Explore Packages
          </Link>
          <Link to="/countries" className="btn" style={{ background: '#f4f4f5', color: '#18181b', border: '1px solid #e4e4e7' }}>
            🌍 Explore 250 Countries
          </Link>
          <Link to="/explore" className="btn-icon-circular" title="Interactive 3D Globe">
            🌐
          </Link>
        </div>

        {/* Social Proof / Partner Bar */}
        <div className="logo-bar">
          <span>✈ MAKEMYTRIP</span>
          <span>🚆 IRCTC OFFICIAL</span>
          <span>✈ AMADEUS</span>
          <span>🚌 REDBUS</span>
          <span>🏨 MARRIOTT</span>
          <span>⭐ TRIPADVISOR</span>
        </div>
      </div>

      {/* Popular Routes Quick Discover Bar (Flights, Trains, Buses) */}
      <div style={{ background: '#f8fafc', padding: '4rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="badge-pill" style={{ marginBottom: '0.5rem', background: '#e0f2fe', color: '#0369a1' }}>
                🚀 Rapid Booking Routes
              </div>
              <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', margin: 0, color: '#0f172a' }}>
                Popular Flights & <span className="italic" style={{ color: '#2563eb' }}>Intercity Routes</span>
              </h2>
            </div>
            <Link to="/search?category=flights" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              View All Routes →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {[
              { type: 'Flight', icon: '✈️', route: 'New York (JFK) → Paris (CDG)', airline: 'Air France', price: '$520', link: '/search?category=flights&origin=New+York&destination=Paris' },
              { type: 'Flight', icon: '✈️', route: 'London (LHR) → Dubai (DXB)', airline: 'Emirates Express', price: '$460', link: '/search?category=flights&origin=London&destination=Dubai' },
              { type: 'Train', icon: '🚆', route: 'New Delhi → Varanasi (Vande Bharat)', airline: 'IRCTC Superfast', price: '$24', link: '/search?category=trains&origin=New+Delhi&destination=Varanasi' },
              { type: 'Bus', icon: '🚌', route: 'Bengaluru → Goa (Volvo AC Sleeper)', airline: 'FlyBus / Intercity', price: '$18', link: '/search?category=buses&origin=Bengaluru&destination=Goa' },
            ].map((r, idx) => (
              <Link
                key={idx}
                to={r.link}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#93c5fd';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    {r.type}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>
                  {r.route}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                  {r.airline}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Starting from</span>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.1rem' }}>{r.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Curated Packages from Database */}
      {featuredPackages.length > 0 && (
        <div style={{ background: '#ffffff', padding: '5rem 0', borderBottom: '1px solid #f1f5f9' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="badge-pill" style={{ marginBottom: '0.5rem', background: '#dcfce7', color: '#15803d' }}>
                  ✨ Handcrafted Tours & Stays
                </div>
                <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', margin: 0, color: '#0f172a' }}>
                  Featured Holiday <span className="italic" style={{ color: '#16a34a' }}>Packages</span>
                </h2>
              </div>
              <Link to="/packages" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
                Browse All Packages →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {featuredPackages.map(pkg => (
                <div
                  key={pkg.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={pkg.image_url || fallbackImg}
                      alt={pkg.name}
                      onError={e => { e.currentTarget.src = fallbackImg; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(0,0,0,0.65)',
                      color: '#ffffff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)'
                    }}>
                      {pkg.duration_days} Days / {pkg.duration_days - 1} Nights
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                        📍 {pkg.dest_name || 'Global Destination'}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
                        {pkg.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                        Stay at {pkg.hotel_name || 'Verified Luxury Resort'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>From</span>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                          ${pkg.base_price} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/ person</span>
                        </div>
                      </div>
                      <Link to={`/book/${pkg.id}`} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '10px' }}>
                        Book Trip ⚡
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Destinations - Almanac Sticky Stack */}
      <div className="cards-container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '2rem' }}>
          Trending Destinations
        </h2>
        
        {/* Card 1 */}
        <div className="almanac-card" style={{ zIndex: 10 }}>
          <div className="almanac-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800"
              alt="Paris"
              className="almanac-image"
              onError={e => { e.currentTarget.src = fallbackImg; }}
            />
          </div>
          <div className="almanac-content">
            <div>
              <div className="almanac-meta">Featured ∙ Paris, France</div>
              <h3 className="almanac-title">Wander through the cobblestone streets and witness the sparkling Eiffel Tower at midnight.</h3>
            </div>
            <div className="almanac-footer">
              <span className="almanac-tag">luxury</span>
              <Link to="/destinations" className="almanac-btn" title="Explore">→</Link>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="almanac-card" style={{ zIndex: 11, top: '140px' }}>
          <div className="almanac-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1512453979498-5ea266f8e320?auto=format&fit=crop&q=80&w=800"
              alt="Dubai"
              className="almanac-image"
              onError={e => { e.currentTarget.src = fallbackImg; }}
            />
          </div>
          <div className="almanac-content">
            <div>
              <div className="almanac-meta">Trending ∙ Dubai, UAE</div>
              <h3 className="almanac-title">Experience the peak of modern architecture and luxury in the golden heart of the desert.</h3>
            </div>
            <div className="almanac-footer">
              <span className="almanac-tag">premium</span>
              <Link to="/destinations" className="almanac-btn" title="Explore">→</Link>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="almanac-card" style={{ zIndex: 12, top: '160px' }}>
          <div className="almanac-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&q=80&w=800"
              alt="Maldives"
              className="almanac-image"
              onError={e => { e.currentTarget.src = fallbackImg; }}
            />
          </div>
          <div className="almanac-content">
            <div>
              <div className="almanac-meta">Popular ∙ Maldives</div>
              <h3 className="almanac-title">Crystal clear turquoise waters and private overwater villas for the ultimate escape.</h3>
            </div>
            <div className="almanac-footer">
              <span className="almanac-tag">tropical</span>
              <Link to="/destinations" className="almanac-btn" title="Explore">→</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Wanderlust Categories - Scattered Polaroids */}
      <div className="wanderlust-section">
        <h2 className="wanderlust-title">
          <span className="italic" style={{ color: '#fcd34d' }}>Categories</span><br />
          Worth Wandering
        </h2>
        
        <div className="polaroid-gallery">
          <Link to="/destinations?category=Mountains" className="polaroid" style={{ top: '10%', left: '10%', transform: 'rotate(-15deg)', zIndex: 1 }}>
            <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" alt="Mountains" className="polaroid-img" onError={e => { e.currentTarget.src = fallbackImg; }} />
            <div className="polaroid-caption">Mountains</div>
          </Link>

          <Link to="/destinations?category=Beaches" className="polaroid" style={{ top: '40%', left: '25%', transform: 'rotate(8deg)', zIndex: 2 }}>
            <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80" alt="Beaches" className="polaroid-img" onError={e => { e.currentTarget.src = fallbackImg; }} />
            <div className="polaroid-caption">Beaches</div>
          </Link>

          <Link to="/destinations?category=Historical" className="polaroid" style={{ top: '15%', left: '40%', transform: 'rotate(-5deg)', zIndex: 3 }}>
            <img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80" alt="Historical" className="polaroid-img" onError={e => { e.currentTarget.src = fallbackImg; }} />
            <div className="polaroid-caption">Historical</div>
          </Link>

          <Link to="/destinations?category=Religious" className="polaroid" style={{ top: '50%', left: '55%', transform: 'rotate(-12deg)', zIndex: 4 }}>
            <img src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80" alt="Religious" className="polaroid-img" onError={e => { e.currentTarget.src = fallbackImg; }} />
            <div className="polaroid-caption">Religious Places</div>
          </Link>

          <Link to="/destinations?category=Plains" className="polaroid" style={{ top: '20%', right: '15%', transform: 'rotate(18deg)', zIndex: 1 }}>
            <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80" alt="Plains" className="polaroid-img" onError={e => { e.currentTarget.src = fallbackImg; }} />
            <div className="polaroid-caption">Plains</div>
          </Link>

          <Link to="/destinations?category=Forests" className="polaroid" style={{ top: '60%', right: '5%', transform: 'rotate(-8deg)', zIndex: 2 }}>
            <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" alt="Forests" className="polaroid-img" onError={e => { e.currentTarget.src = fallbackImg; }} />
            <div className="polaroid-caption">Forests</div>
          </Link>
        </div>
      </div>

      {/* Global Countries Spotlight Section */}
      <div style={{ background: '#ffffff', padding: '5rem 0', borderTop: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="badge-pill" style={{ marginBottom: '0.75rem', background: '#dbeafe', color: '#1d4ed8' }}>
                🌍 250 Countries Catalogued
              </div>
              <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', margin: 0, color: '#09090b' }}>
                Discover Countries <span className="italic" style={{ color: '#2563eb' }}>Worldwide</span>
              </h2>
            </div>
            <Link
              to="/countries"
              style={{
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Browse All 250 Countries →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {[
              { code: 'fr', name: 'France', emoji: '🇫🇷', capital: 'Paris', region: 'Europe', pop: '67.4M', season: 'Spring & Summer' },
              { code: 'jp', name: 'Japan', emoji: '🇯🇵', capital: 'Tokyo', region: 'Asia', pop: '125.8M', season: 'Spring (Cherry Blossoms)' },
              { code: 'it', name: 'Italy', emoji: '🇮🇹', capital: 'Rome', region: 'Europe', pop: '59.5M', season: 'Spring to Autumn' },
              { code: 'ae', name: 'UAE', emoji: '🇦🇪', capital: 'Abu Dhabi', region: 'Middle East', pop: '9.9M', season: 'Winter (Nov - Mar)' },
              { code: 'au', name: 'Australia', emoji: '🇦🇺', capital: 'Canberra', region: 'Oceania', pop: '25.7M', season: 'Oct - Apr' },
              { code: 'br', name: 'Brazil', emoji: '🇧🇷', capital: 'Brasília', region: 'Americas', pop: '212.5M', season: 'Dec - Mar' },
              { code: 'mv', name: 'Maldives', emoji: '🇲🇻', capital: 'Malé', region: 'Asia', pop: '540k', season: 'Nov - Apr' },
              { code: 'za', name: 'South Africa', emoji: '🇿🇦', capital: 'Pretoria', region: 'Africa', pop: '59.3M', season: 'May - Sep' },
            ].map((c) => (
              <Link
                key={c.code}
                to={`/countries/${c.code}`}
                style={{
                  textDecoration: 'none',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  color: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{c.emoji}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: '#e2e8f0',
                    color: '#334155',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px'
                  }}>
                    {c.region}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-sans)', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>
                  {c.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                  Capital: <strong style={{ color: '#334155' }}>{c.capital}</strong>
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <span>Pop: {c.pop}</span>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>Explore Guide →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
