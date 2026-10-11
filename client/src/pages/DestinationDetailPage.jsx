import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationsAPI } from '../api/client';
import axios from 'axios';

export default function DestinationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    destinationsAPI.getById(id).then(async res => {
      setData(res.data);
      
      // Fetch live country facts
      try {
        const cRes = await axios.get(`https://restcountries.com/v3.1/name/${res.data.destination.country}?fullText=true`);
        if (cRes.data && cRes.data[0]) {
          setCountryData(cRes.data[0]);
        }
      } catch (e) { console.error('Fact fetch failed'); }
      
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
        <img src={d.image_url} alt={d.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
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
                    <img src={p.image_url} alt={p.name} className="card-img" style={{ height: 160 }} />
                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 className="card-title">{p.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                        {p.duration_days} Days • Max {p.max_group_size} people
                      </div>
                      <div className="price" style={{ margin: 'var(--space-md) 0' }}>
                        ${p.base_price.toLocaleString()}<span>/person</span>
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
                  <img src={h.image_url} alt={h.name} className="card-img" style={{ height: 160 }} />
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-sm">
                      <h3 className="card-title" style={{ margin: 0 }}>{h.name}</h3>
                      <span className="badge badge-standard">{h.category}</span>
                    </div>
                    <div className="stars" style={{ marginBottom: 'var(--space-sm)' }}>★ {h.rating}</div>
                    <div className="price price-small">${h.price_per_night.toLocaleString()}<span>/night</span></div>
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
                      <div className="label">Capital</div>
                      <div style={{ fontWeight: 600 }}>{countryData.capital?.[0] || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="label">Population</div>
                      <div style={{ fontWeight: 600 }}>{countryData.population?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="label">Language</div>
                      <div style={{ fontWeight: 600 }}>{Object.values(countryData.languages || {})[0] || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="label">Currency</div>
                      <div style={{ fontWeight: 600 }}>
                        {Object.values(countryData.currencies || {})[0]?.name || 'N/A'} 
                        ({Object.values(countryData.currencies || {})[0]?.symbol})
                      </div>
                    </div>
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
