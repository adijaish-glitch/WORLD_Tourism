import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page container" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '8rem', lineHeight: 1, fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#e4e4e7', marginBottom: '1rem' }}>
        404
      </div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1rem', color: '#09090b' }}>
        Page Not Found
      </h1>
      <p style={{ color: '#71717a', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
        <Link to="/destinations" className="btn btn-secondary" style={{ background: '#f4f4f5', color: '#09090b', border: '1px solid #e4e4e7' }}>
          Explore Destinations
        </Link>
      </div>
    </div>
  );
}
