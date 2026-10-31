import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { destinationsAPI, countriesAPI } from '../api/client';
import { IconGlobe, IconLocationPin } from '../components/ui/Icons';

function checkWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function ExploreMapPage() {
  const [destinations, setDestinations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [viewMode, setViewMode] = useState('destinations'); // 'destinations' | 'countries'
  const [searchQuery, setSearchQuery] = useState('');
  const [webglSupported] = useState(() => checkWebGL());
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? Math.max(window.innerHeight - 80, 450) : 700
  });
  const [searchParams] = useSearchParams();
  const globeRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: Math.max(window.innerHeight - 80, 450)
      });
    };
    window.addEventListener('resize', handleResize);

    // Fetch destinations
    destinationsAPI.list({ limit: 200 })
      .then(res => {
        setDestinations((res.data.destinations || []).filter(d => d.latitude && d.longitude));
      })
      .catch(console.error);

    // Fetch countries for globe
    countriesAPI.getGlobePoints()
      .then(res => {
        setCountries(res.data.countries || []);
      })
      .catch(console.error);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize auto-rotation on the 3D globe
  useEffect(() => {
    const timer = setTimeout(() => {
      if (globeRef.current) {
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.6;
          controls.enableDamping = true;
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Handle URL query parameters to fly to specific country / coordinates
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng && globeRef.current) {
      const timer = setTimeout(() => {
        if (globeRef.current?.pointOfView) {
          globeRef.current.pointOfView({
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            altitude: 0.9
          }, 2000);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const activeData = useMemo(() => {
    let list;
    if (viewMode === 'countries') {
      list = countries.map(c => ({
        lat: c.latitude,
        lng: c.longitude,
        name: c.name,
        flag: '',
        code: (c.code || '').toLowerCase(),
        subtitle: c.capital,
        isCountry: true
      }));
    } else {
      list = destinations.map(d => ({
        lat: d.latitude,
        lng: d.longitude,
        name: d.name,
        flag: '',
        id: d.id,
        subtitle: d.country,
        isCountry: false
      }));
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(item =>
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query))
    );
  }, [viewMode, destinations, countries, searchQuery]);

  const handlePointClick = (point) => {
    if (globeRef.current?.pointOfView) {
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.8 }, 1400);
      setTimeout(() => {
        if (point.isCountry) {
          navigate(`/countries/${point.code}`);
        } else {
          navigate(`/destinations/${point.id}`);
        }
      }, 1600);
    }
  };

  const handleSearchSelect = (item) => {
    if (globeRef.current?.pointOfView) {
      globeRef.current.pointOfView({ lat: item.lat, lng: item.lng, altitude: 0.85 }, 1600);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#050508' }}>
      {/* Floating Control Overlay */}
      <div style={{
        position: 'absolute',
        top: '1.5rem',
        left: '1.5rem',
        zIndex: 10,
        maxWidth: '420px',
        width: 'calc(100% - 3rem)',
        pointerEvents: 'none'
      }}>
        <div style={{
          background: 'rgba(10, 15, 30, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: 0, color: 'white', lineHeight: 1.15 }}>
            Explore our <span className="italic" style={{ color: '#60a5fa' }}>Planet</span>
          </h1>
          <p style={{ color: '#a1a1aa', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.4, margin: '0.5rem 0 1rem' }}>
            Rotate the 3D globe and click any marker to inspect travel guides, hotels, and tour packages.
          </p>

          {/* Search on Globe */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder={`Search ${viewMode === 'countries' ? 'countries...' : 'destinations...'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Search Quick Matches */}
          {searchQuery.trim() && (
            <div style={{
              maxHeight: '140px',
              overflowY: 'auto',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {activeData.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSearchSelect(item)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <span>{item.flag} {item.name}</span>
                  <span style={{ color: '#60a5fa', fontSize: '0.75rem' }}>Fly To →</span>
                </div>
              ))}
              {activeData.length === 0 && (
                <div style={{ padding: '0.5rem', color: '#71717a', fontSize: '0.8rem', textAlign: 'center' }}>
                  No matches found on the globe
                </div>
              )}
            </div>
          )}

          {/* View Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { setViewMode('destinations'); setSearchQuery(''); }}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: viewMode === 'destinations' ? '#2563eb' : 'rgba(255,255,255,0.08)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconLocationPin size={14} />
                <span>Destinations ({destinations.length})</span>
              </span>
            </button>

            <button
              onClick={() => { setViewMode('countries'); setSearchQuery(''); }}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: viewMode === 'countries' ? '#2563eb' : 'rgba(255,255,255,0.08)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconGlobe size={14} />
                <span>Countries ({countries.length || 250})</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Globe or WebGL Fallback */}
      {webglSupported ? (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, #0f172a 0%, #050508 70%)'
        }}>
          <Globe
            ref={globeRef}
            width={windowSize.width}
            height={windowSize.height}
            globeImageUrl="/textures/earth-blue-marble.jpg"
            bumpImageUrl="/textures/earth-topology.png"
            backgroundColor="rgba(0,0,0,0)"
            showAtmosphere={true}
            atmosphereColor="#60a5fa"
            atmosphereAltitude={0.2}
            ringsData={activeData}
            ringColor={() => (viewMode === 'countries' ? '#38bdf8' : '#eab308')}
            ringMaxRadius={2}
            ringPropagationSpeed={2}
            ringRepeatPeriod={1500}
            onRingClick={handlePointClick}
            htmlElementsData={activeData}
            htmlElement={d => {
              const el = document.createElement('div');
              el.innerHTML = `
                <div style="color: #fff; font-size: 11px; font-weight: 500; font-family: var(--font-sans); background: rgba(15,23,42,0.85); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px); cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                  <span>${d.flag}</span>
                  <span>${d.name}</span>
                </div>
              `;
              el.onclick = () => handlePointClick(d);
              return el;
            }}
          />
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <IconGlobe size={64} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3D Hardware Acceleration Unavailable</h2>
          <p style={{ maxWidth: '500px', color: '#a1a1aa', marginBottom: '2rem' }}>
            Your browser does not currently have WebGL 3D rendering enabled. You can still explore all destinations and countries using our interactive directories below.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/countries" className="btn btn-primary">Browse 250 Countries</Link>
            <Link to="/destinations" className="btn" style={{ background: '#27272a', color: 'white' }}>Browse Destinations</Link>
          </div>
        </div>
      )}
    </div>
  );
}
