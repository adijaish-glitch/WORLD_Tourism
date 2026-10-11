import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { authAPI } from '../api/client';
import { useToast } from '../components/ui/ToastContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { success, error } = useToast();

  const avatarPresets = ['🏔️', '🌴', '🎒', '🧭', '✈️', '🗺️', '⛵', '🏨'];

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || '🏔️',
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        username: user.username || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '🏔️',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        full_name: profile.full_name,
        username: profile.username || undefined,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      });
      success(res.data.message || 'Profile updated!');
      if (res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      return error('New passwords do not match');
    }
    if (passwords.new_password.length < 8) {
      return error('New password must be at least 8 characters');
    }
    setSavingPw(true);
    try {
      await authAPI.updateProfile({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      success('Password changed successfully!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      error(err.response?.data?.error || 'Password update failed');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="container page" style={{ maxWidth: '720px' }}>
      <div className="page-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <h1>Traveler Profile</h1>
        <p>Manage your account identity, security preferences, and travel badges.</p>
      </div>

      {/* Account Overview Header */}
      <div className="card" style={{ marginBottom: '2rem', background: '#fafafa' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '3rem', width: '72px', height: '72px', borderRadius: '50%', background: '#fff', border: '2px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {profile.avatar_url || '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#09090b' }}>
              {user?.full_name || 'Traveler'}
            </h2>
            <div style={{ color: '#71717a', fontSize: '0.9rem', marginTop: '2px' }}>
              {user?.email} {user?.username ? `(@${user.username})` : ''}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="badge-pill">
                {user?.role === 'admin' ? '🛡️ Admin' : '👤 Traveler'}
              </span>
              <span className="badge-pill" style={{ background: user?.email_verified ? '#dcfce7' : '#fef9c3', color: user?.email_verified ? '#166534' : '#854d0e' }}>
                {user?.email_verified ? '✓ Verified Email' : '⚠ Unverified Email'}
              </span>
              <span className="badge-pill" style={{ textTransform: 'capitalize' }}>
                🔗 Provider: {user?.provider || 'local'}
              </span>
            </div>
          </div>
          {!user?.email_verified && (
            <Link to={`/verify-email?email=${encodeURIComponent(user?.email || '')}`} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
              Verify Now
            </Link>
          )}
        </div>
      </div>

      {/* Profile Info Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', color: '#09090b' }}>
            Personal Credentials
          </h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="label">Avatar Icon</label>
              <div className="avatar-preset-grid">
                {avatarPresets.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-chip ${profile.avatar_url === emoji ? 'active' : ''}`}
                    onClick={() => setProfile({ ...profile, avatar_url: emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
                Email address is anchored to your account
              </div>
            </div>

            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Username (Optional)</label>
              <input
                type="text"
                className="input"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="traveler_alias"
              />
            </div>

            <div className="form-group">
              <label className="label">Phone Number</label>
              <input
                type="text"
                className="input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1-555-0100"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '0.5rem' }}>
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Change Password */}
      {user?.provider === 'local' && (
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', color: '#09090b' }}>
              Security & Password
            </h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwords.current_password}
                  onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">New Password (min 8 chars)</label>
                <input
                  type="password"
                  className="input"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPw} style={{ marginTop: '0.5rem' }}>
                {savingPw ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
