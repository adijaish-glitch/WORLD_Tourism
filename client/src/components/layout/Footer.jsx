import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand"><span style={{ color: 'var(--color-teal)' }}>🌍</span> TIMS</div>
            <p className="footer-desc">
              Your ultimate travel companion. Explore the world's most beautiful destinations, book premium packages, and create unforgettable memories.
            </p>
          </div>
          <div>
            <div className="footer-title">Explore</div>
            <div className="footer-links">
              <Link to="/destinations">Destinations</Link>
              <Link to="/packages">Tour Packages</Link>
              <Link to="/explore">Interactive Map</Link>
            </div>
          </div>
          <div>
            <div className="footer-title">Company</div>
            <div className="footer-links">
              <Link to="/about">About Us</Link>
              <Link to="/register">Create Account</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>
          <div>
            <div className="footer-title">Legal</div>
            <div className="footer-links">
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} TIMS. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
