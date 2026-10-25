import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      <div className="hero">
      
      {/* Top Announcement Pill */}
      <div className="flex justify-center mb-6">
        <div className="badge-pill">
          Award-winning travel experiences ✈️
        </div>
      </div>

      {/* Hero Headline (Serif + Italic Serif) */}
      <h1 className="hero-title mb-6">
        Discover the world's most <br />
        <span className="italic">Breathtaking Destinations</span>
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle mb-8">
        Curated itineraries, luxury hotel bookings, and dynamic travel packages—all beautifully tailored to create your perfect getaway.
      </p>

      {/* Buttons */}
      <div className="flex justify-center items-center gap-4 mt-8 flex-wrap" style={{ marginBottom: '4rem' }}>
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

      {/* Social Proof / Logo Bar */}
      <div className="logo-bar">
        <span>✈ EMIRATES</span>
        <span>🏨 MARRIOTT</span>
        <span>🌍 EXPEDIA</span>
        <span>⭐ TRIPADVISOR</span>
        <span>💼 AIRBNB</span>
      </div>
    </div>

      {/* Featured Destinations - Almanac Sticky Stack */}
      <div className="cards-container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '2rem' }}>Trending Destinations</h2>
        
        {/* Card 1 */}
        <div className="almanac-card" style={{ zIndex: 10 }}>
          <div className="almanac-image-wrapper">
            <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800" alt="Paris" className="almanac-image" />
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
            <img src="https://images.unsplash.com/photo-1512453979498-5ea266f8e320?auto=format&fit=crop&q=80&w=800" alt="Dubai" className="almanac-image" />
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
            <img src="https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&q=80&w=800" alt="Maldives" className="almanac-image" />
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
            <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" alt="Mountains" className="polaroid-img" />
            <div className="polaroid-caption">Mountains</div>
          </Link>

          <Link to="/destinations?category=Beaches" className="polaroid" style={{ top: '40%', left: '25%', transform: 'rotate(8deg)', zIndex: 2 }}>
            <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80" alt="Beaches" className="polaroid-img" />
            <div className="polaroid-caption">Beaches</div>
          </Link>

          <Link to="/destinations?category=Historical" className="polaroid" style={{ top: '15%', left: '40%', transform: 'rotate(-5deg)', zIndex: 3 }}>
            <img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80" alt="Historical" className="polaroid-img" />
            <div className="polaroid-caption">Historical</div>
          </Link>

          <Link to="/destinations?category=Religious" className="polaroid" style={{ top: '50%', left: '55%', transform: 'rotate(-12deg)', zIndex: 4 }}>
            <img src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80" alt="Religious" className="polaroid-img" />
            <div className="polaroid-caption">Religious Places</div>
          </Link>

          <Link to="/destinations?category=Plains" className="polaroid" style={{ top: '20%', right: '15%', transform: 'rotate(18deg)', zIndex: 1 }}>
            <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80" alt="Plains" className="polaroid-img" />
            <div className="polaroid-caption">Plains</div>
          </Link>

          <Link to="/destinations?category=Forests" className="polaroid" style={{ top: '60%', right: '5%', transform: 'rotate(-8deg)', zIndex: 2 }}>
            <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" alt="Forests" className="polaroid-img" />
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
