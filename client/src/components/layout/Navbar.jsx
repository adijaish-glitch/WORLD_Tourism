import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pages with dark backgrounds where navbar needs light text
  const isDarkPage = location.pathname === '/explore';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navBg = scrolled
    ? 'rgba(255,255,255,0.85)'
    : 'transparent';

  const textColor = (path) => {
    const active = location.pathname === path;
    if (scrolled) return active ? '#09090b' : '#71717a';
    if (isDarkPage) return active ? '#ffffff' : '#a1a1aa';
    return active ? '#09090b' : '#71717a';
  };

  const logoColor = scrolled ? '#09090b' : isDarkPage ? '#ffffff' : '#09090b';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: navBg,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease',
      }}>
        <Link to="/" style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.2rem', color: logoColor, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>❖</span> TIMS
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '2.5rem' }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/explore', label: 'Map' },
            { to: '/destinations', label: 'Destinations' },
            { to: '/packages', label: 'Packages' },
            { to: '/about', label: 'About' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: textColor(link.to),
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: location.pathname === link.to ? 600 : 500,
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="nav-auth-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              {isAdmin && <Link to="/admin" style={{ color: textColor('/admin'), textDecoration: 'none', fontSize: '0.9rem' }}>Admin</Link>}
              <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ color: textColor('/dashboard'), textDecoration: 'none', fontSize: '0.9rem' }}>
                Dashboard
              </Link>
              <Link to="/profile" style={{ color: textColor('/profile'), textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem' }}>{user?.avatar_url || '👤'}</span>
                <span>{user?.full_name?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button onClick={logout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textColor(''), fontSize: '0.9rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: textColor('/login'), textDecoration: 'none', fontSize: '0.9rem' }}>Log in</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            flexDirection: 'column', gap: '5px', padding: '4px',
          }}
        >
          <span style={{ display: 'block', width: '22px', height: '2px', background: logoColor, borderRadius: '2px', transition: 'all 0.3s', transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: logoColor, borderRadius: '2px', transition: 'all 0.3s', opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: logoColor, borderRadius: '2px', transition: 'all 0.3s', transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="nav-mobile-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.98)', zIndex: 99,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '2rem', padding: '2rem',
        }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/explore', label: 'Map' },
            { to: '/destinations', label: 'Destinations' },
            { to: '/packages', label: 'Packages' },
            { to: '/about', label: 'About' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: location.pathname === link.to ? '#09090b' : '#71717a',
                textDecoration: 'none', fontSize: '1.25rem',
                fontWeight: location.pathname === link.to ? 700 : 500,
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid #e4e4e7', width: '200px', margin: '0.5rem 0' }} />
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ color: '#71717a', textDecoration: 'none', fontSize: '1.1rem' }}>Dashboard</Link>
              <Link to="/profile" style={{ color: '#71717a', textDecoration: 'none', fontSize: '1.1rem' }}>Profile</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', fontSize: '1.1rem' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#71717a', textDecoration: 'none', fontSize: '1.1rem' }}>Log in</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
