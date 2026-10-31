import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { countriesAPI } from '../api/client';
import {
  IconExploreAtlas,
  IconSearch,
  IconClose,
  IconGlobe
} from '../components/ui/Icons';

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [regions, setRegions] = useState([]);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 24;

  // Load regions once
  useEffect(() => {
    countriesAPI.getRegions()
      .then(res => {
        if (res.data?.regions) setRegions(res.data.regions);
      })
      .catch(console.error);
  }, []);

  // Fetch countries on filter change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = {
      page,
      limit,
      sort,
      order,
    };
    if (search.trim()) params.search = search.trim();
    if (region !== 'all') params.region = region;

    countriesAPI.list(params)
      .then(res => {
        if (!cancelled) {
          setCountries(res.data.countries || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [page, search, region, sort, order]);

  // Handle region switch
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setPage(1);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Format population nicely (e.g., 67.4M, 1.4B)
  const formatPop = (pop) => {
    if (!pop) return 'N/A';
    if (pop >= 1_000_000_000) return (pop / 1_000_000_000).toFixed(1) + 'B';
    if (pop >= 1_000_000) return (pop / 1_000_000).toFixed(1) + 'M';
    if (pop >= 1_000) return (pop / 1_000).toFixed(1) + 'k';
    return pop.toLocaleString();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="badge-pill" style={{ marginBottom: '1rem', background: '#e0f2fe', color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <IconExploreAtlas size={18} />
            <span>Global Atlas & Tourism Directory</span>
          </div>
          <h1 style={{ fontSize: '3.2rem', color: '#09090b', marginBottom: '1rem' }}>
            Explore Every <span className="italic" style={{ color: '#2563eb' }}>Country</span>
          </h1>
          <p style={{ color: '#71717a', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            Discover essential travel facts, flags, capitals, currencies, seasonal guides, and tours for all 250 countries and territories worldwide.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid #e4e4e7',
          marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 320px' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by country, capital, code..."
                value={search}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.8rem',
                  borderRadius: '16px',
                  border: '1px solid #e4e4e7',
                  background: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.background = '#f8fafc'; }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  <IconClose size={12} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: 500 }}>Sort by:</span>
              <select
                value={`${sort}-${order}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split('-');
                  setSort(s);
                  setOrder(o);
                  setPage(1);
                }}
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: '16px',
                  border: '1px solid #e4e4e7',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="name-ASC">Name (A → Z)</option>
                <option value="name-DESC">Name (Z → A)</option>
                <option value="population-DESC">Population (Highest)</option>
                <option value="population-ASC">Population (Lowest)</option>
                <option value="area-DESC">Area (Largest)</option>
              </select>
            </div>
          </div>

          {/* Region Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#71717a', marginRight: '0.5rem', fontWeight: 500 }}>Region:</span>
            {['all', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'].map((r) => {
              const active = region.toLowerCase() === r.toLowerCase();
              return (
                <button
                  key={r}
                  onClick={() => handleRegionChange(r)}
                  style={{
                    padding: '0.45rem 1.1rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: active ? 600 : 500,
                    background: active ? '#09090b' : '#f1f5f9',
                    color: active ? '#ffffff' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {r === 'all' ? 'All Regions' : r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter & 3D Globe banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
          <p style={{ color: '#71717a', fontSize: '0.9rem', margin: 0 }}>
            Showing <strong>{countries.length}</strong> of <strong>{total}</strong> countries
          </p>
          <Link
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IconGlobe size={16} />
            <span>View on 3D Globe →</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '320px',
                  borderRadius: '20px',
                  background: '#f1f5f9',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            ))}
          </div>
        ) : countries.length === 0 ? (
          /* Empty State */
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px solid #e4e4e7',
            maxWidth: '500px',
            margin: '2rem auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <IconExploreAtlas size={54} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No countries found</h3>
            <p style={{ color: '#71717a', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              We couldn't find any country matching "{search}". Try searching for another name or reset filters.
            </p>
            <button
              onClick={() => { setSearch(''); setRegion('all'); }}
              className="btn btn-primary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Country Cards Grid */
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {countries.map(c => (
              <motion.div
                key={c.code}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                style={{
                  background: 'white',
                  borderRadius: '22px',
                  border: '1px solid #e4e4e7',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  transition: 'box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.07)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'; }}
              >
                {/* Flag Header */}
                <div style={{
                  position: 'relative',
                  height: '140px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <img
                    src={c.flag_url}
                    alt={`${c.name} flag`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  {/* Fallback Emoji */}
                  <span style={{ display: 'none', fontSize: '4rem' }}>{c.flag_emoji}</span>

                  {/* Region badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em'
                  }}>
                    {c.region}
                  </span>

                  {/* ISO Code Pill */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#0f172a',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    {c.code}
                  </span>
                </div>

                {/* Country Info Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: '#0f172a',
                      marginBottom: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{c.flag_emoji}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </span>
                    </h3>
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {c.official_name !== c.name ? c.official_name : c.subregion}
                    </p>
                  </div>

                  {/* Quick Specs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>CAPITAL</span>
                      <strong style={{ color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                        {c.capital || 'N/A'}
                      </strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                      <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>POPULATION</span>
                      <strong style={{ color: '#1e293b', display: 'block' }}>
                        {formatPop(c.population)}
                      </strong>
                    </div>
                  </div>

                  {c.currencies && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#334155', fontWeight: 600 }}>Currency: {c.currencies.split(',')[0]}</span>
                    </div>
                  )}

                  {/* Action Link */}
                  <div style={{ marginTop: 'auto' }}>
                    <Link
                      to={`/countries/${c.code.toLowerCase()}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '0.65rem 1rem',
                        background: '#f1f5f9',
                        color: '#0f172a',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = '#ffffff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    >
                      Explore Country Guide →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '3.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: page === 1 ? '#f8fafc' : 'white',
                color: page === 1 ? '#94a3b8' : '#0f172a',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              ← Previous
            </button>

            <span style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0.5rem' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: page === totalPages ? '#f8fafc' : 'white',
                color: page === totalPages ? '#94a3b8' : '#0f172a',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
