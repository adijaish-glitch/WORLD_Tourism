import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { countriesAPI } from '../api/client';

export default function CountryDetailPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [country, setCountry] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    countriesAPI.getByCode(code)
      .then(res => {
        if (!cancelled) {
          setCountry(res.data.country);
          setDestinations(res.data.destinations || []);
          setPackages(res.data.packages || []);
          setHotels(res.data.hotels || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error(err);
          setError('Country details could not be loaded.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [code]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', animation: 'spin 1.5s infinite linear' }}>🌍</div>
          <p style={{ color: '#71717a', marginTop: '1rem', fontWeight: 500 }}>Loading country details...</p>
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Country Not Found</h2>
          <p style={{ color: '#71717a', marginBottom: '1.5rem' }}>We could not find information for country code "{code}".</p>
          <Link to="/countries" className="btn btn-primary">← Back to All Countries</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '100px', paddingBottom: '90px' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          <Link to="/countries" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>Countries</Link>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{country.name}</span>
        </div>

        {/* Hero Card */}
        <div style={{
          background: 'white',
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          marginBottom: '2.5rem'
        }}>
          {/* Header Banner */}
          <div style={{
            position: 'relative',
            minHeight: '260px',
            background: 'linear-gradient(135deg, #09090b 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '2.5rem',
            overflow: 'hidden'
          }}>
            {/* Background Glow & Flag overlay */}
            <div style={{
              position: 'absolute',
              right: '-5%',
              top: '-20%',
              width: '450px',
              height: '350px',
              opacity: 0.22,
              filter: 'blur(30px)',
              pointerEvents: 'none',
              backgroundImage: `url(${country.flag_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', width: '100%' }}>
              {/* Flag image */}
              <div style={{
                width: '120px',
                height: '80px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                border: '2px solid rgba(255,255,255,0.2)',
                background: '#334155',
                flexShrink: 0
              }}>
                <img
                  src={country.flag_url}
                  alt={country.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Title & tags */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(10px)' }}>
                    {country.region} • {country.subregion}
                  </span>
                  <span style={{ background: 'rgba(59,130,246,0.3)', color: '#93c5fd', padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    ISO: {country.code} / {country.code3}
                  </span>
                </div>

                <h1 style={{ color: 'white', fontSize: '2.75rem', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {country.name} <span style={{ fontSize: '2.2rem' }}>{country.flag_emoji}</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
                  {country.official_name}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  to={`/explore?country=${encodeURIComponent(country.name)}&lat=${country.latitude}&lng=${country.longitude}`}
                  className="btn"
                  style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.4rem' }}
                >
                  🌐 View on 3D Globe
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            padding: '2rem',
            background: 'white',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Capital</span>
              <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{country.capital || 'N/A'}</strong>
            </div>

            <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Population</span>
              <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{country.population ? Number(country.population).toLocaleString() : 'N/A'}</strong>
            </div>

            <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Currency</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{country.currencies || 'N/A'}</strong>
            </div>

            <div style={{ borderLeft: '3px solid #8b5cf6', paddingLeft: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Languages</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{country.languages || 'N/A'}</strong>
            </div>

            <div style={{ borderLeft: '3px solid #ec4899', paddingLeft: '1rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Best Travel Time</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{country.best_season || 'Year-round'}</strong>
            </div>
          </div>

          {/* Overview / Wikipedia Travel summary */}
          <div style={{ padding: '2rem 2.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: '#0f172a' }}>
              About {country.name}
            </h3>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {country.summary}
            </p>

            {/* Borders Section */}
            {country.borders && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Neighboring Borders:</span>
                {country.borders.split(',').map(b => b.trim()).filter(Boolean).map(borderCode => (
                  <Link
                    key={borderCode}
                    to={`/countries/${borderCode.toLowerCase()}`}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  >
                    {borderCode}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TIMS Connected Tours and Packages Section */}
        <div style={{ marginTop: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
            <div>
              <div className="badge-pill" style={{ marginBottom: '0.5rem', background: '#dbeafe', color: '#1e40af' }}>
                TIMS Experiences
              </div>
              <h2 style={{ fontSize: '2.2rem', margin: 0, color: '#0f172a' }}>
                Tours & Stays in <span className="italic" style={{ color: '#2563eb' }}>{country.name}</span>
              </h2>
            </div>
            {destinations.length > 0 && (
              <Link to="/packages" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                View All Packages →
              </Link>
            )}
          </div>

          {destinations.length > 0 ? (
            <div>
              {/* Destinations cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {destinations.map(d => (
                  <div
                    key={d.id}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                    }}
                  >
                    <img
                      src={d.image_url}
                      alt={d.name}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{d.name}</h3>
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          ★ {d.rating}
                        </span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {d.description}
                      </p>
                      <Link
                        to={`/destinations/${d.id}`}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '0.65rem 1rem',
                          background: '#09090b',
                          color: 'white',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontWeight: 500,
                          fontSize: '0.9rem'
                        }}
                      >
                        Explore Destination
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Connected Packages */}
              {packages.length > 0 && (
                <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: '#0f172a' }}>
                    Available Tour Packages in {country.name}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {packages.map(p => (
                      <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', background: '#f8fafc' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{p.name}</h4>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          ⏱ {p.duration_days} Days • Hotel: {p.hotel_name || 'Included'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>STARTING AT</span>
                            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>${p.base_price}</div>
                          </div>
                          <Link to={`/book/${p.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            Book Package
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom Trip Call To Action */
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✈️</div>
              <h3 style={{ fontSize: '1.5rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>
                Want to travel to {country.name}?
              </h3>
              <p style={{ color: '#3b82f6', maxWidth: '550px', margin: '0 auto 1.5rem auto', fontSize: '1rem', lineHeight: 1.6 }}>
                We are constantly expanding our curated global network. You can explore all our active destination packages or request a custom itinerary for {country.name}.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/packages" className="btn btn-primary">
                  Browse Active Packages
                </Link>
                <Link to="/explore" className="btn" style={{ background: 'white', color: '#1e3a8a', border: '1px solid #bfdbfe' }}>
                  Explore on 3D Globe
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
