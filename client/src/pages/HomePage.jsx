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
      <div className="flex justify-center items-center gap-4 mt-8" style={{ marginBottom: '4rem' }}>
        <Link to="/packages" className="btn btn-primary">
          Explore Packages
        </Link>
        <Link to="/explore" className="btn-icon-circular" title="Interactive Map">
          🌍
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
            <img src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Mountains" className="polaroid-img" />
            <div className="polaroid-caption">Mountains</div>
          </Link>

          <Link to="/destinations?category=Beaches" className="polaroid" style={{ top: '40%', left: '25%', transform: 'rotate(8deg)', zIndex: 2 }}>
            <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Beaches" className="polaroid-img" />
            <div className="polaroid-caption">Beaches</div>
          </Link>

          <Link to="/destinations?category=Historical" className="polaroid" style={{ top: '15%', left: '40%', transform: 'rotate(-5deg)', zIndex: 3 }}>
            <img src="https://images.unsplash.com/photo-1552832233-4752b5d44878?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Historical" className="polaroid-img" />
            <div className="polaroid-caption">Historical</div>
          </Link>

          <Link to="/destinations?category=Religious" className="polaroid" style={{ top: '50%', left: '55%', transform: 'rotate(-12deg)', zIndex: 4 }}>
            <img src="https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Religious" className="polaroid-img" />
            <div className="polaroid-caption">Religious Places</div>
          </Link>

          <Link to="/destinations?category=Plains" className="polaroid" style={{ top: '20%', right: '15%', transform: 'rotate(18deg)', zIndex: 1 }}>
            <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Plains" className="polaroid-img" />
            <div className="polaroid-caption">Plains</div>
          </Link>

          <Link to="/destinations?category=Forests" className="polaroid" style={{ top: '60%', right: '5%', transform: 'rotate(-8deg)', zIndex: 2 }}>
            <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Forests" className="polaroid-img" />
            <div className="polaroid-caption">Forests</div>
          </Link>
        </div>
      </div>
    </>
  );
}
