import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  getAvatarComponent,
  NavProfile,
  NavTrips,
  IconAdminOffice,
  IconFlight,
  NavSecurity
} from '../ui/Icons';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Pages with dark backgrounds where navbar needs light text
  const isDarkPage = location.pathname === '/explore';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const navBg = scrolled
    ? 'rgba(255,255,255,0.92)'
    : 'transparent';

  const textColor = (path) => {
    const active = location.pathname === path;
    if (scrolled) return active ? '#09090b' : '#71717a';
    if (isDarkPage) return active ? '#ffffff' : '#a1a1aa';
    return active ? '#09090b' : '#71717a';
  };

  const logoColor = scrolled ? '#09090b' : isDarkPage ? '#ffffff' : '#09090b';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/flights', label: 'Flights' },
    { to: '/hotels', label: 'Hotels' },
    { to: '/trains', label: 'Trains' },
    { to: '/buses', label: 'Buses' },
    { to: '/packages', label: 'Packages' },
    { to: '/countries', label: 'Countries' },
    { to: '/explore', label: 'Map' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: navBg,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        padding: '0.85rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease',
      }}>
        <Link to="/" style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.35rem', color: logoColor, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-emblem.png" alt="TIMS Emblem" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)' }} />
          <span style={{ letterSpacing: '0.04em' }}>TIMS</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: textColor(link.to),
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: location.pathname === link.to ? 700 : 500,
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
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              {/* Profile Trigger Button */}
              <button
                onClick={() => setProfileDropdownOpen(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isDarkPage && !scrolled ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)',
                  border: isDarkPage && !scrolled ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.08)',
                  padding: '6px 14px 6px 8px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  color: textColor(''),
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                aria-expanded={profileDropdownOpen}
                aria-label="User Profile Menu"
              >
                {user?.avatar_url && user.avatar_url.startsWith('http') ? (
                  <img src={user.avatar_url} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {getAvatarComponent(user?.avatar_url || '🏔️', 26)}
                  </span>
                )}
                <span>{user?.full_name?.split(' ')[0] || 'Profile'}</span>
                <span style={{
                  fontSize: '0.75rem',
                  transform: profileDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  opacity: 0.7,
                  marginLeft: '2px'
                }}>
                  ▼
                </span>
              </button>

              {/* Profile Dropdown Menu with Logout */}
              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '260px',
                  background: '#ffffff',
                  color: '#18181b',
                  borderRadius: '12px',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  padding: '0.75rem 0',
                  zIndex: 200,
                  animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}>
                  {/* Dropdown User Header */}
                  <div style={{ padding: '0.5rem 1rem 0.75rem 1rem', borderBottom: '1px solid #f4f4f5' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#09090b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.full_name || 'Traveler'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {user?.email || user?.phone || 'Member'}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: isAdmin ? '#fef3c7' : '#f4f4f5', color: isAdmin ? '#92400e' : '#52525b', fontWeight: 600 }}>
                      {isAdmin ? <><NavSecurity size={12} /> Administrator</> : <><IconFlight size={12} /> Traveler</>}
                    </div>
                  </div>

                  {/* Dropdown Links */}
                  <div style={{ padding: '0.4rem 0' }}>
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.6rem 1rem',
                        color: '#27272a',
                        textDecoration: 'none',
                        fontSize: '0.88rem',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f4f4f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <NavProfile size={16} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.6rem 1rem',
                        color: '#27272a',
                        textDecoration: 'none',
                        fontSize: '0.88rem',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f4f4f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <NavTrips size={16} />
                      <span>Dashboard & Bookings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '0.6rem 1rem',
                          color: '#27272a',
                          textDecoration: 'none',
                          fontSize: '0.88rem',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f4f4f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <IconAdminOffice size={16} />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #f4f4f5', margin: '0.2rem 0' }}></div>

                  {/* Log Out Button inside Profile Dropdown */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0.65rem 1rem',
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
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
          gap: '1.25rem', padding: '2rem',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: location.pathname === link.to ? '#09090b' : '#71717a',
                textDecoration: 'none', fontSize: '1.15rem',
                fontWeight: location.pathname === link.to ? 700 : 500,
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid #e4e4e7', width: '200px', margin: '0.5rem 0' }} />
          {isAuthenticated ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#09090b' }}>{user?.full_name}</div>
                <div style={{ fontSize: '0.85rem', color: '#71717a' }}>{user?.email}</div>
              </div>
              <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ color: '#71717a', textDecoration: 'none', fontSize: '1.1rem' }}>Dashboard</Link>
              <Link to="/profile" style={{ color: '#71717a', textDecoration: 'none', fontSize: '1.1rem' }}>Profile</Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); navigate('/login'); }}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  borderRadius: '8px',
                  padding: '8px 24px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Logout
              </button>
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
