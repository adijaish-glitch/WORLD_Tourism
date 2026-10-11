import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../../components/ui/ToastContext';

// ─── SVG Icons ───
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.8 1.09-1.92.97-3.04-.94.04-2.07.63-2.73 1.41-.58.67-1.09 1.76-.95 2.85 1.05.08 2.06-.42 2.71-1.22z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

// ─── Password Strength Evaluator ───
function evaluatePassword(pwd) {
  if (!pwd) return { score: 0, label: 'None', color: '#e4e4e7', rules: { length: false, upper: false, number: false, special: false } };
  
  const rules = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };

  const count = Object.values(rules).filter(Boolean).length;
  
  if (count <= 1) return { score: 25, label: 'Weak', color: '#ef4444', rules };
  if (count === 2) return { score: 50, label: 'Fair', color: '#f59e0b', rules };
  if (count === 3) return { score: 75, label: 'Good', color: '#3b82f6', rules };
  return { score: 100, label: 'Strong', color: '#10b981', rules };
}

// ─── 1. LOGIN PAGE ───
export function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, socialLogin, guestLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!identifier || !password) {
      setFormError('Please enter both your email/username and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier, password, rememberMe);
      success('Welcome back, ' + (user.full_name || 'Traveler') + '!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid email/username or password';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    setLoading(true);
    setFormError('');
    try {
      const mockSocial = {
        provider,
        provider_id: `${provider}_${Date.now()}`,
        email: `${provider}.traveler@example.com`,
        full_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Traveler`,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${provider}`
      };
      const user = await socialLogin(mockSocial);
      success(`Signed in with ${provider}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.error || `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      const user = await guestLogin();
      success('Logged in with Guest Access!');
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.error || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container printer-container">
      <div className="printer-slit"></div>
      <div className="receipt-wrapper">
        <div className="receipt-card">
          <div className="receipt-header">
            <h1 className="receipt-title">Boarding Access</h1>
            <div className="receipt-meta">
              <span>Gate: Online</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {formError && (
            <div className="auth-inline-alert error">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Social Sign-in Buttons */}
          <div className="social-grid">
            <button type="button" className="social-btn" onClick={() => handleSocial('google')} disabled={loading}>
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button type="button" className="social-btn" onClick={() => handleSocial('apple')} disabled={loading}>
              <AppleIcon />
              <span>Apple</span>
            </button>
            <button type="button" className="social-btn" onClick={() => handleSocial('github')} disabled={loading}>
              <GitHubIcon />
              <span>GitHub</span>
            </button>
          </div>

          <button type="button" className="guest-btn" onClick={handleGuest} disabled={loading}>
            <span>🎟️</span> Instant Guest Pass (Demo Mode)
          </button>

          <div className="auth-divider">
            <span>Or continue with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="receipt-label">Email Address or Username</label>
              <input
                type="text"
                className="input receipt-input"
                placeholder="name@example.com or traveler"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="receipt-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input receipt-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" style={{ color: '#09090b', textDecoration: 'underline', fontSize: '0.8rem' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn receipt-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In →'}
            </button>

            <div className="receipt-barcode"></div>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#71717a', fontSize: '0.85rem', fontFamily: 'Courier New, monospace' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 'bold', color: '#09090b' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 2. SIGN-UP / REGISTRATION PAGE ───
export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarUrl: '🏔️',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, socialLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const avatarPresets = ['🏔️', '🌴', '🎒', '🧭', '✈️', '🗺️', '⛵', '🏨'];
  const pwdEval = evaluatePassword(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!formData.acceptTerms) {
      setFormError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        full_name: formData.fullName,
        username: formData.username || undefined,
        email: formData.email,
        password: formData.password,
        avatar_url: formData.avatarUrl
      });
      success('Account created! Welcome to TIMS.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    setLoading(true);
    try {
      const mockSocial = {
        provider,
        provider_id: `${provider}_${Date.now()}`,
        email: `${provider}.newuser@example.com`,
        full_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Traveler`,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${provider}`
      };
      await socialLogin(mockSocial);
      success(`Signed up with ${provider}!`);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.error || `Social sign-up failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container printer-container">
      <div className="printer-slit"></div>
      <div className="receipt-wrapper">
        <div className="receipt-card">
          <div className="receipt-header">
            <h1 className="receipt-title">Pass Registration</h1>
            <div className="receipt-meta">
              <span>New Passenger</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {formError && (
            <div className="auth-inline-alert error">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Social Sign up */}
          <div className="social-grid">
            <button type="button" className="social-btn" onClick={() => handleSocial('google')} disabled={loading}>
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button type="button" className="social-btn" onClick={() => handleSocial('apple')} disabled={loading}>
              <AppleIcon />
              <span>Apple</span>
            </button>
            <button type="button" className="social-btn" onClick={() => handleSocial('github')} disabled={loading}>
              <GitHubIcon />
              <span>GitHub</span>
            </button>
          </div>

          <div className="auth-divider">
            <span>Or register credentials</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="receipt-label">Full Name *</label>
              <input
                type="text"
                className="input receipt-input"
                placeholder="Jane Traveler"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="receipt-label">Optional Username</label>
              <input
                type="text"
                className="input receipt-input"
                placeholder="janetravels"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Avatar Selector */}
            <div className="form-group">
              <label className="receipt-label">Traveler Avatar</label>
              <div className="avatar-preset-grid">
                {avatarPresets.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-chip ${formData.avatarUrl === emoji ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, avatarUrl: emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="receipt-label">Email Address *</label>
              <input
                type="email"
                className="input receipt-input"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="receipt-label">Password * (min 8 chars)</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input receipt-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="strength-meter-container">
                  <div className="strength-bar-bg">
                    <div
                      className="strength-bar-fill"
                      style={{ width: `${pwdEval.score}%`, backgroundColor: pwdEval.color }}
                    ></div>
                  </div>
                  <div className="strength-label-row">
                    <span>Strength: <strong style={{ color: pwdEval.color }}>{pwdEval.label}</strong></span>
                    <span>{pwdEval.score}%</span>
                  </div>
                  <div className="strength-rules-list">
                    <span className={`strength-rule-item ${pwdEval.rules.length ? 'valid' : 'invalid'}`}>
                      {pwdEval.rules.length ? '✓' : '○'} 8+ characters
                    </span>
                    <span className={`strength-rule-item ${pwdEval.rules.upper ? 'valid' : 'invalid'}`}>
                      {pwdEval.rules.upper ? '✓' : '○'} Uppercase letter
                    </span>
                    <span className={`strength-rule-item ${pwdEval.rules.number ? 'valid' : 'invalid'}`}>
                      {pwdEval.rules.number ? '✓' : '○'} Number
                    </span>
                    <span className={`strength-rule-item ${pwdEval.rules.special ? 'valid' : 'invalid'}`}>
                      {pwdEval.rules.special ? '✓' : '○'} Special character
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="receipt-label">Confirm Password *</label>
              <div className="auth-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input receipt-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <EyeIcon off={showConfirmPassword} />
                </button>
              </div>
              {formData.confirmPassword && (
                <div style={{ fontSize: '0.75rem', marginTop: '4px', fontFamily: 'Courier New, monospace' }}>
                  {passwordsMatch ? (
                    <span style={{ color: '#15803d' }}>✓ Passwords match</span>
                  ) : (
                    <span style={{ color: '#b91c1c' }}>✕ Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="auth-checkbox-row" style={{ marginTop: '1rem', alignItems: 'flex-start' }}>
              <label className="auth-checkbox-label" style={{ lineHeight: '1.4' }}>
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  required
                />
                <span>
                  I agree to the <Link to="/terms" target="_blank" style={{ color: '#09090b', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" target="_blank" style={{ color: '#09090b', textDecoration: 'underline' }}>Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn receipt-btn" disabled={loading}>
              {loading ? 'Creating Pass...' : 'Issue Member Ticket →'}
            </button>

            <div className="receipt-barcode"></div>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#71717a', fontSize: '0.85rem', fontFamily: 'Courier New, monospace' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 'bold', color: '#09090b' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 3. FORGOT PASSWORD PAGE ───
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [testLink, setTestLink] = useState('');
  const [formError, setFormError] = useState('');

  const { forgotPassword } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email) {
      setFormError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSubmitted(true);
      if (res.resetLink) {
        setTestLink(res.resetLink);
      }
      success('Password recovery link generated!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send recovery link';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container printer-container">
      <div className="printer-slit"></div>
      <div className="receipt-wrapper">
        <div className="receipt-card">
          <div className="receipt-header">
            <h1 className="receipt-title">Pass Recovery</h1>
            <div className="receipt-meta">
              <span>Security Dept</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {formError && (
            <div className="auth-inline-alert error">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-inline-alert success" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <span>📬</span>
                <div>
                  <strong>Reset Link Dispatched</strong>
                  <p style={{ marginTop: '4px' }}>
                    A secure password reset link has been dispatched to <strong>{email}</strong>. It is valid for 1 hour.
                  </p>
                </div>
              </div>

              {testLink && (
                <div style={{ background: '#f4f4f5', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#71717a', marginBottom: '4px', fontFamily: 'Courier New, monospace' }}>
                    ⚡ Instant Demo Link
                  </div>
                  <Link
                    to={testLink}
                    className="btn receipt-btn"
                    style={{ margin: 0, padding: '0.6rem !important', textDecoration: 'none' }}
                  >
                    Click to Open Reset Page →
                  </Link>
                </div>
              )}

              <p style={{ fontSize: '0.85rem', color: '#71717a', fontFamily: 'Courier New, monospace' }}>
                Remembered your password? <Link to="/login" style={{ fontWeight: 'bold', color: '#09090b' }}>Back to Sign In</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1.5rem', fontFamily: 'Courier New, monospace', lineHeight: '1.5' }}>
                Enter your account email. We will send you a single-use secure reset token with 1-hour expiration.
              </p>

              <div className="form-group">
                <label className="receipt-label">Account Email Address</label>
                <input
                  type="email"
                  className="input receipt-input"
                  placeholder="traveler@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn receipt-btn" disabled={loading}>
                {loading ? 'Sending Link...' : 'Dispatch Reset Link →'}
              </button>

              <div className="receipt-barcode"></div>

              <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#71717a', fontSize: '0.85rem', fontFamily: 'Courier New, monospace' }}>
                <Link to="/login" style={{ color: '#09090b' }}>← Return to Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 4. RESET PASSWORD PAGE ───
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [formError, setFormError] = useState('');

  const { resetPassword } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
  }, [tokenParam]);

  const pwdEval = evaluatePassword(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!token) {
      setFormError('Reset token is missing or invalid');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccessState(true);
      success('Password reset successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reset password. Link may have expired.';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container printer-container">
      <div className="printer-slit"></div>
      <div className="receipt-wrapper">
        <div className="receipt-card">
          <div className="receipt-header">
            <h1 className="receipt-title">Reset Security Key</h1>
            <div className="receipt-meta">
              <span>Token Verification</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {formError && (
            <div className="auth-inline-alert error">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {successState ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-inline-alert success" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <span>🎉</span>
                <div>
                  <strong>Key Reset Complete</strong>
                  <p style={{ marginTop: '4px' }}>
                    Your password has been successfully updated and secured with bcrypt hashing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn receipt-btn"
                onClick={() => navigate('/login')}
              >
                Sign In With New Key →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {!tokenParam && (
                <div className="form-group">
                  <label className="receipt-label">Reset Token Code</label>
                  <input
                    type="text"
                    className="input receipt-input"
                    placeholder="Paste 64-character token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="receipt-label">New Password (min 8 chars)</label>
                <div className="auth-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input receipt-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <EyeIcon off={showPassword} />
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="strength-meter-container">
                    <div className="strength-bar-bg">
                      <div
                        className="strength-bar-fill"
                        style={{ width: `${pwdEval.score}%`, backgroundColor: pwdEval.color }}
                      ></div>
                    </div>
                    <div className="strength-label-row">
                      <span>Strength: <strong style={{ color: pwdEval.color }}>{pwdEval.label}</strong></span>
                      <span>{pwdEval.score}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="receipt-label">Confirm New Password</label>
                <div className="auth-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input receipt-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <EyeIcon off={showConfirmPassword} />
                  </button>
                </div>
                {confirmPassword && (
                  <div style={{ fontSize: '0.75rem', marginTop: '4px', fontFamily: 'Courier New, monospace' }}>
                    {passwordsMatch ? (
                      <span style={{ color: '#15803d' }}>✓ Passwords match</span>
                    ) : (
                      <span style={{ color: '#b91c1c' }}>✕ Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="btn receipt-btn" disabled={loading}>
                {loading ? 'Updating Password...' : 'Save New Password →'}
              </button>

              <div className="receipt-barcode"></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 5. EMAIL VERIFICATION PAGE ───
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const { verifyEmail, resendVerification } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (tokenParam) {
      handleVerify(tokenParam, emailParam);
    }
  }, [tokenParam, emailParam]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleVerify = async (tok = token, mail = email) => {
    if (!tok) return;
    setLoading(true);
    setStatusMessage('');
    try {
      await verifyEmail(tok, mail);
      setVerified(true);
      success('Email successfully verified!');
    } catch (err) {
      setStatusMessage(err.response?.data?.error || 'Verification failed. Token may be expired.');
      error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setStatusMessage('Please enter your email to resend verification.');
      return;
    }
    setLoading(true);
    try {
      await resendVerification(email);
      setResendTimer(30);
      success('Verification token resent to your email!');
    } catch (err) {
      setStatusMessage(err.response?.data?.error || 'Failed to resend token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container printer-container">
      <div className="printer-slit"></div>
      <div className="receipt-wrapper">
        <div className="receipt-card">
          <div className="receipt-header">
            <h1 className="receipt-title">Email Verification</h1>
            <div className="receipt-meta">
              <span>Identity Check</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {statusMessage && (
            <div className="auth-inline-alert error">
              <span>⚠️</span>
              <span>{statusMessage}</span>
            </div>
          )}

          {verified ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-inline-alert success" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <span>✅</span>
                <div>
                  <strong>Email Verified!</strong>
                  <p style={{ marginTop: '4px' }}>Your traveler credentials have been authenticated.</p>
                </div>
              </div>

              <button
                type="button"
                className="btn receipt-btn"
                onClick={() => navigate('/dashboard')}
              >
                Proceed to Dashboard →
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1.25rem', fontFamily: 'Courier New, monospace', lineHeight: '1.5' }}>
                Verify your email address to confirm passenger identity and unlock full booking capabilities.
              </p>

              <div className="form-group">
                <label className="receipt-label">Email Address</label>
                <input
                  type="email"
                  className="input receipt-input"
                  placeholder="traveler@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="receipt-label">Verification Code / Token</label>
                <input
                  type="text"
                  className="input receipt-input"
                  placeholder="Paste token or code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="button"
                className="btn receipt-btn"
                onClick={() => handleVerify()}
                disabled={loading || !token}
              >
                {loading ? 'Verifying...' : 'Confirm Verification →'}
              </button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resendTimer > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendTimer > 0 ? '#a1a1aa' : '#18181b',
                    fontSize: '0.8rem',
                    fontFamily: 'Courier New, monospace',
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {resendTimer > 0 ? `Resend available in ${resendTimer}s` : 'Resend verification code'}
                </button>
              </div>

              <div className="receipt-barcode"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
