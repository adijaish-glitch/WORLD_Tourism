import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { destinationsAPI, countriesAPI } from '../api/client';

export default function ExploreMapPage() {
  const [destinations, setDestinations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [viewMode, setViewMode] = useState('destinations'); // 'destinations' | 'countries'
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [searchParams] = useSearchParams();
  const globeRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    // Fetch destinations
    destinationsAPI.list({ limit: 200 }).then(res => {
      setDestinations(res.data.destinations.filter(d => d.latitude && d.longitude));
    }).catch(console.error);

    // Fetch countries for globe
    countriesAPI.getGlobePoints().then(res => {
      setCountries(res.data.countries || []);
    }).catch(console.error);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle URL query parameters to fly to specific country / coordinates
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng && globeRef.current) {
      setTimeout(() => {
        globeRef.current.pointOfView({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          altitude: 0.9
        }, 2000);
      }, 800);
    }
  }, [searchParams]);

  const activeData = useMemo(() => {
    if (viewMode === 'countries') {
      return countries.map(c => ({
        lat: c.latitude,
        lng: c.longitude,
        name: c.name,
        flag: c.flag_emoji || '🏳️',
        code: c.code.toLowerCase(),
        subtitle: c.capital,
        isCountry: true
      }));
    }
    return destinations.map(d => ({
      lat: d.latitude,
      lng: d.longitude,
      name: d.name,
      flag: '📍',
      id: d.id,
      subtitle: d.country,
      isCountry: false
    }));
  }, [viewMode, destinations, countries]);

  const handlePointClick = (point) => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.8 }, 1500);
      setTimeout(() => {
        if (point.isCountry) {
          navigate(`/countries/${point.code}`);
        } else {
          navigate(`/destinations/${point.id}`);
        }
      }, 1800);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#050508' }}>
      
      {/* Overlay UI Header */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, maxWidth: '420px', pointerEvents: 'none' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.2rem', margin: 0, color: 'white', lineHeight: 1.1 }}>
          Explore our <br/><span className="italic" style={{ color: '#60a5fa' }}>Planet</span>
        </h1>
        <p style={{ color: '#a1a1aa', marginTop: '0.85rem', fontSize: '1rem', fontFamily: 'var(--font-sans)', lineHeight: 1.5 }}>
          Rotate the interactive globe and click any marker to explore full tourism details and travel guides.
        </p>

        {/* View Switcher Tabs */}
        <div style={{ pointerEvents: 'auto', display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button
            onClick={() => setViewMode('destinations')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: viewMode === 'destinations' ? '#2563eb' : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s'
            }}
          >
            ★ Featured Spots ({destinations.length})
          </button>

          <button
            onClick={() => setViewMode('countries')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: viewMode === 'countries' ? '#2563eb' : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s'
            }}
          >
            🌍 All Countries ({countries.length || 250})
          </button>
        </div>
      </div>

      {/* 3D Globe Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Globe
          ref={globeRef}
          width={windowSize.width}
          height={windowSize.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="#050508"
          showAtmosphere={true}
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.15}
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
    </div>
  );
}
