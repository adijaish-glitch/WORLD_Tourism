import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { destinationsAPI } from '../api/client';
import axios from 'axios';

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real API data mixed in
  const [countriesData, setCountriesData] = useState({});

  const search = searchParams.get('search') || '';
  const region = searchParams.get('region') || '';

  useEffect(() => {
    // Fetch regions
    destinationsAPI.getRegions().then(res => setRegions(res.data.regions));

    // Fetch destinations
    setLoading(true);
    destinationsAPI.list({ search, region }).then(async res => {
      const dests = res.data.destinations;
      setDestinations(dests);
      
      // Fetch real country data from REST Countries API
      try {
        const uniqueCountries = [...new Set(dests.map(d => d.country))];
        const countryPromises = uniqueCountries.map(c => 
          axios.get(`https://restcountries.com/v3.1/name/${c}?fullText=true`).catch(() => null)
        );
        const responses = await Promise.all(countryPromises);
        const cData = {};
        responses.forEach(r => {
          if (r && r.data && r.data[0]) {
            const data = r.data[0];
            cData[data.name.common] = {
              flag: data.flags.svg,
              currency: Object.values(data.currencies || {})[0]?.name,
              language: Object.values(data.languages || {})[0],
            };
          }
        });
        setCountriesData(cData);
      } catch (err) {
        console.error("Failed to fetch real country data", err);
      }
      setLoading(false);
    });
  }, [search, region]);

  return (
    <div className="page container">
      <div className="page-header text-center">
        <h1>Explore Destinations</h1>
        <p>Discover the world's most breathtaking places.</p>
      </div>

      <div className="filter-bar">
        <input 
          type="text" 
          className="input" 
          placeholder="Search destinations..." 
          value={search}
          onChange={e => setSearchParams(prev => { prev.set('search', e.target.value); return prev; })}
          style={{ flex: 1, minWidth: '250px' }}
        />
        <select 
          className="select"
          value={region}
          onChange={e => setSearchParams(prev => { 
            if (e.target.value) prev.set('region', e.target.value);
            else prev.delete('region');
            return prev; 
          })}
        >
          <option value="">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-img"></div>
              <div className="card-body">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌍</div>
          <h3>No destinations found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {destinations.map(d => (
            <Link to={`/destinations/${d.id}`} key={d.id} className="card" style={{ display: 'block' }}>
              <div style={{ position: 'relative' }}>
                <img src={d.image_url} alt={d.name} className="card-img" />
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="stars">★</span> <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{d.rating}</span>
                </div>
              </div>
              <div className="card-body">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>{d.name}</h3>
                  {countriesData[d.country]?.flag && (
                    <img src={countriesData[d.country].flag} alt={d.country} style={{ width: 24, height: 16, borderRadius: 2, objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                  {d.country} • {d.region}
                </div>
                <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {d.description}
                </p>
                
                {countriesData[d.country] && (
                  <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {countriesData[d.country].language && <div>🗣️ {countriesData[d.country].language}</div>}
                    {countriesData[d.country].currency && <div>💰 {countriesData[d.country].currency}</div>}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
