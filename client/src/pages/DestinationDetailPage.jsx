import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationsAPI, countriesAPI } from '../api/client';

export default function DestinationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    destinationsAPI.getById(id).then(async res => {
      setData(res.data);
      
      // Fetch country facts reliably from local countriesAPI
      try {
        const cRes = await countriesAPI.getByCode(res.data.destination.country);
        if (cRes.data && cRes.data.country) {
          setCountryData(cRes.data.country);
        }
      } catch (e) {
        console.error('Country fetch error', e);
      }
      
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="container page"><div className="splash-bar mx-auto mt-xl"><div className="splash-bar-inner"></div></div></div>;
  if (!data) return <div className="container page"><div className="empty-state">Destination not found.</div></div>;

  const { destination: d, hotels, packages, reviews } = data;

  return (
    <div>
      {/* Hero Header */}
      <div style={{ position: 'relative', height: '60vh', minHeight: '400px', display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--space-3xl)' }}>
        <img 
          src={d.image_url} 
          alt={d.name} 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-deep) 0%, rgba(5,5,8,0.3) 50%, rgba(5,5,8,0.7) 100%)', zIndex: 1 }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
            <div className="badge badge-premium">{d.region}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f5b731', fontWeight: 700 }}>
              ★ {d.rating}
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
            {d.name}
          </h1>
          <div style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: 'var(--space-sm)' }}>
            {d.country}
          </div>
        </div>
      </div>

      <div className="container page" style={{ paddingTop: 'var(--space-xl)' }}>
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 'var(--space-2xl)' }}>
          
          {/* Main Content */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: 'var(--space-md)' }}>Overview</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-2xl)' }}>
              {d.description}
            </p>

            {/* Packages */}
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: 'var(--space-lg)' }}>Tour Packages</h2>
            {packages.length === 0 ? <p className="text-muted">No packages available.</p> : (
              <div className="grid grid-2" style={{ marginBottom: 'var(--space-3xl)' }}>
                {packages.map(p => (
                  <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="card-img" 
                      style={{ height: 160 }} 
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 className="card-title">{p.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                        {p.duration_days} Days • Max {p.max_group_size} people
                      </div>
                      <div className="price" style={{ margin: 'var(--space-md) 0' }}>
                        ${Number(p.base_price || 0).toLocaleString()}<span>/person</span>
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <Link to={`/book/${p.id}`} className="btn btn-primary w-full">Book Now</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hotels */}
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: 'var(--space-lg)' }}>Recommended Hotels</h2>
            <div className="grid grid-2" style={{ marginBottom: 'var(--space-3xl)' }}>
              {hotels.map(h => (
                <div key={h.id} className="card">
                  <img 
                    src={h.image_url} 
                    alt={h.name} 
                    className="card-img" 
                    style={{ height: 160 }} 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-sm">
                      <h3 className="card-title" style={{ margin: 0 }}>{h.name}</h3>
                      <span className="badge badge-standard">{h.category}</span>
                    </div>
                    <div className="stars" style={{ marginBottom: 'var(--space-sm)' }}>★ {h.rating}</div>
                    <div className="price price-small">${Number(h.price_per_night || 0).toLocaleString()}<span>/night</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: 'var(--space-lg)' }}>Traveler Reviews</h2>
            {reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : (
              <div className="grid" style={{ gap: 'var(--space-md)' }}>
                {reviews.map(r => (
                  <div key={r.id} className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                    <div className="flex justify-between items-center mb-sm">
                      <div style={{ fontWeight: 600 }}>{r.reviewer_name}</div>
                      <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="glass-card" style={{ padding: 'var(--space-xl)', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: 'var(--space-lg)' }}>Destination Facts</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div>
                  <div className="label">Best Season</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.best_season}</div>
                </div>
                
                {countryData && (
                  <>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                      <div className="label">Capital City</div>
                      <div style={{ fontWeight: 600 }}>{countryData.capital || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="label">Population</div>
                      <div style={{ fontWeight: 600 }}>{countryData.population ? Number(countryData.population).toLocaleString() : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="label">Language</div>
                      <div style={{ fontWeight: 600 }}>{countryData.languages || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="label">Currency</div>
                      <div style={{ fontWeight: 600 }}>
                        {countryData.currencies || 'N/A'}
                      </div>
                    </div>
                    {countryData.code && (
                      <div style={{ paddingTop: 'var(--space-xs)' }}>
                        <Link
                          to={`/countries/${countryData.code.toLowerCase()}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--accent-primary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          {countryData.flag_emoji} Explore {countryData.name} Guide →
                        </Link>
                      </div>
                    )}
                  </>
                )}
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                  <div className="label">Coordinates</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {d.latitude.toFixed(4)}°, {d.longitude.toFixed(4)}°
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
