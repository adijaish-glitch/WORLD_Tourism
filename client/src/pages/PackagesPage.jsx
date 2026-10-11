import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { packagesAPI } from '../api/client';

export default function PackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  useEffect(() => {
    setLoading(true);
    packagesAPI.list({ min_price: minPrice, max_price: maxPrice }).then(res => {
      setPackages(res.data.packages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [minPrice, maxPrice]);

  return (
    <div className="page container">
      <div className="page-header text-center">
        <h1>Tour Packages</h1>
        <p>Curated experiences for every traveler.</p>
      </div>

      <div className="filter-bar" style={{ justifyContent: 'center' }}>
        <input 
          type="number" 
          className="input" 
          placeholder="Min Price ($)" 
          value={minPrice}
          onChange={e => setSearchParams(prev => { 
            if(e.target.value) prev.set('min_price', e.target.value); else prev.delete('min_price');
            return prev; 
          })}
          style={{ width: 150 }}
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
          style={{ width: 150 }}
        />
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
              <img src={p.image_url} alt={p.name} className="card-img" />
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-center mb-sm">
                  <h3 className="card-title" style={{ margin: 0 }}>{p.name}</h3>
                  <div className="badge badge-standard">{p.duration_days} Days</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                  📍 {p.dest_name}
                </div>
                <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 'var(--space-md)' }}>
                  {p.description}
                </p>
                <div className="price" style={{ margin: 'auto 0 var(--space-md)' }}>
                  ${p.base_price.toLocaleString()}<span>/person</span>
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
