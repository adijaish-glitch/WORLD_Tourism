import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { destinationsAPI } from '../api/client';

export default function ExploreMapPage() {
  const [destinations, setDestinations] = useState([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const globeRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    destinationsAPI.list({ limit: 50 }).then(res => {
      setDestinations(res.data.destinations.filter(d => d.latitude && d.longitude));
    });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const globeData = useMemo(() => {
    return destinations.map(d => ({
      lat: d.latitude,
      lng: d.longitude,
      size: 1.5,
      color: '#06b6d4', // Cyan accent
      name: d.name,
      country: d.country,
      id: d.id
    }));
  }, [destinations]);

  const handlePointClick = (point) => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 0.8 }, 1500);
      setTimeout(() => navigate(`/destinations/${point.id}`), 1800);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#050508' }}>
      
      {/* Overlay UI */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, maxWidth: '400px', pointerEvents: 'none' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', margin: 0, color: 'white', lineHeight: 1.1 }}>
          Explore our <br/><span className="italic" style={{ color: '#60a5fa' }}>Planet</span>
        </h1>
        <p style={{ color: '#a1a1aa', marginTop: '1rem', fontSize: '1.1rem', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
          Click on any glowing radar ping to zoom in and discover detailed information about that destination.
        </p>
      </div>

      {/* 3D Globe */}
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
          ringsData={globeData}
          ringColor={() => '#eab308'}
          ringMaxRadius={2}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1500}
          onRingClick={handlePointClick}
          htmlElementsData={globeData}
          htmlElement={d => {
            const el = document.createElement('div');
            el.innerHTML = `<div style="color: #fff; font-size: 11px; font-weight: 500; font-family: var(--font-sans); background: rgba(0,0,0,0.5); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15); backdrop-filter: blur(8px); cursor: pointer;">${d.name}</div>`;
            el.onclick = () => handlePointClick(d);
            return el;
          }}
        />
      </div>
    </div>
  );
}
