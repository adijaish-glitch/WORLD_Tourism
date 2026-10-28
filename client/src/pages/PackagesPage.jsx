import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { packagesAPI } from '../api/client';

export default function PackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  useEffect(() => {
    setLoading(true);
    packagesAPI.list({ search, min_price: minPrice, max_price: maxPrice, limit: 100 }).then(res => {
      setPackages(res.data.packages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search, minPrice, maxPrice]);

  return (
    <div className="page container">
      <div className="page-header text-center">
        <h1>Tour Packages</h1>
        <p>Curated global experiences across all destinations.</p>
      </div>

      <div className="filter-bar" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <input 
          type="text" 
          className="input" 
          placeholder="Search by package, destination, or country..." 
          value={search}
          onChange={e => setSearchParams(prev => { 
            if(e.target.value) prev.set('search', e.target.value); else prev.delete('search');
            return prev; 
          })}
          style={{ minWidth: 280, flex: 1, maxWidth: 400 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="number" 
            className="input" 
            placeholder="Min Price ($)" 
            value={minPrice}
            onChange={e => setSearchParams(prev => { 
              if(e.target.value) prev.set('min_price', e.target.value); else prev.delete('min_price');
              return prev; 
            })}
            style={{ width: 130 }}
          />
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <input 
            type="number" 
            className="input" 
            placeholder="Max Price ($)" 
            value={maxPrice}
            onChange={e => setSearchParams(prev => { 
              if(e.target.value) prev.set('max_price', e.target.value); else prev.delete('max_price');
              return prev; 
            })}
            style={{ width: 130 }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-3">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-img"></div>
              <div className="card-body"><div className="skeleton skeleton-title"></div></div>
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No packages found</h3>
          <p>Try adjusting your price filters.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {packages.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <img 
                src={p.image_url} 
                alt={p.name} 
                className="card-img" 
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-center mb-sm">
                  <h3 className="card-title" style={{ margin: 0 }}>{p.name}</h3>
                  <div className="badge badge-standard">{p.duration_days} Days</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                  📍 {p.dest_name}{p.dest_country ? ` • ${p.dest_country}` : ''}
                </div>
                <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 'var(--space-md)' }}>
                  {p.description}
                </p>
                <div className="price" style={{ margin: 'auto 0 var(--space-md)' }}>
                  ${Number(p.base_price || 0).toLocaleString()}<span>/person</span>
                </div>
                <Link to={`/book/${p.id}`} className="btn btn-primary w-full">Book Now</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
