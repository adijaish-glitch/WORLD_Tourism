import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import { accountAPI, bookingsAPI } from '../api/client';

export default function AccountPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: profile, bookings, wishlist, travellers, security, preferences, support
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // ──────────────────────────────────────────
  // 1. PERSONAL PROFILE STATE
  // ──────────────────────────────────────────
  const avatarPresets = ['🏔️', '🌴', '🎒', '🧭', '✈️', '🗺️', '⛵', '🏨', '🏰', '🌅'];
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    avatar_url: user?.avatar_url || '🏔️',
    language: user?.language || 'en',
    currency: user?.currency || 'USD',
    travel_preferences: user?.travel_preferences || { seat: 'window', dietary: 'none', style: 'luxury' }
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Phone Verification Modal State (Twilio)
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // ──────────────────────────────────────────
  // 2. BOOKINGS STATE
  // ──────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all'); // all, upcoming, completed, cancelled, pending
  const [bookingCategory, setBookingCategory] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // ──────────────────────────────────────────
  // 3. WISHLIST STATE
  // ──────────────────────────────────────────
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistTypeFilter, setWishlistTypeFilter] = useState('all');

  // ──────────────────────────────────────────
  // 4. SAVED TRAVELLERS STATE
  // ──────────────────────────────────────────
  const [travellers, setTravellers] = useState([]);
  const [loadingTravellers, setLoadingTravellers] = useState(false);
  const [travellerModalOpen, setTravellerModalOpen] = useState(false);
  const [editingTraveller, setEditingTraveller] = useState(null);
  const [travellerForm, setTravellerForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'unspecified',
    traveler_type: 'adult',
    phone: '',
    email: '',
    meal_or_dietary: 'None',
    special_assistance: '',
    is_primary: 0
  });

  // ──────────────────────────────────────────
  // 5. LOGIN & SECURITY STATE
  // ──────────────────────────────────────────
  const [securityOverview, setSecurityOverview] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // ──────────────────────────────────────────
  // 6. NOTIFICATIONS & PREFERENCES STATE
  // ──────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [prefForm, setPrefForm] = useState(
    user?.notification_preferences || {
      booking_updates: true,
      sms_alerts: true,
      travel_reminders: true,
      promotions: false
    }
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  // ──────────────────────────────────────────
  // 7. HELP & SUPPORT STATE
  // ──────────────────────────────────────────
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    category: 'booking_inquiry',
    subject: '',
    message: '',
    booking_reference: '',
    priority: 'normal'
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // ──────────────────────────────────────────
  // INITIAL DATA FETCHING
  // ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setProfileForm({
      full_name: user.full_name || '',
      username: user.username || '',
      avatar_url: user.avatar_url || '🏔️',
      language: user.language || 'en',
      currency: user.currency || 'USD',
      travel_preferences: user.travel_preferences || { seat: 'window', dietary: 'none', style: 'luxury' }
    });
    setPhoneInput(user.phone || '');
    if (user.notification_preferences) {
      setPrefForm(user.notification_preferences);
    }
  }, [user]);

  // Load section-specific data on tab change
  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'wishlist') loadWishlist();
    if (activeTab === 'travellers') loadTravellers();
    if (activeTab === 'security') loadSecurity();
    if (activeTab === 'preferences') loadNotifications();
    if (activeTab === 'support') loadTickets();
  }, [activeTab]);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await bookingsAPI.list({ limit: 100 });
      setBookings(Array.isArray(res.data?.bookings) ? res.data.bookings : []);
    } catch (err) {
      error('Failed to load trips and bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const res = await accountAPI.getWishlist();
      setWishlist(res.data?.wishlist || []);
    } catch (err) {
      error('Failed to load wishlist');
    } finally {
      setLoadingWishlist(false);
    }
  };

  const loadTravellers = async () => {
    setLoadingTravellers(true);
    try {
      const res = await accountAPI.getTravellers();
      setTravellers(res.data?.travellers || []);
    } catch (err) {
      error('Failed to load saved travellers');
    } finally {
      setLoadingTravellers(false);
    }
  };

  const loadSecurity = async () => {
    try {
      const res = await accountAPI.getSecurity();
      setSecurityOverview(res.data?.security || null);
    } catch (err) {
      console.warn('Security overview error:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await accountAPI.getNotifications();
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.warn('Notifications load error:', err);
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await accountAPI.getTickets();
      setTickets(res.data?.tickets || []);
    } catch (err) {
      error('Failed to load support tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  // ──────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────
  // Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await accountAPI.updateProfile(profileForm);
      success(res.data.message || 'Profile saved successfully!');
      if (res.data.user) setUser(res.data.user);
    } catch (err) {
      error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Twilio SMS Phone Verification
  const handleSendPhoneOtp = async () => {
    if (!phoneInput || phoneInput.trim().length < 8) {
      return error('Please enter a valid phone number with country code (e.g., +15552345678)');
    }
    setSendingOtp(true);
    try {
      const res = await accountAPI.sendPhoneOtp(phoneInput.trim());
      setOtpSent(true);
      info(res.data.message || 'Verification code sent via SMS!');
      if (res.data.devCode) {
        console.log('📱 [Dev Code Helper]:', res.data.devCode);
      }
    } catch (err) {
      error(err.response?.data?.error || 'Failed to dispatch SMS code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!otpInput || otpInput.trim().length !== 6) {
      return error('Please enter the 6-digit code received via SMS');
    }
    setVerifyingOtp(true);
    try {
      const res = await accountAPI.verifyPhoneOtp(phoneInput.trim(), otpInput.trim());
      success('Phone number verified successfully!');
      if (res.data.user) setUser(res.data.user);
      setPhoneModalOpen(false);
      setOtpSent(false);
      setOtpInput('');
    } catch (err) {
      error(err.response?.data?.error || 'Verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Wishlist Remove
  const handleRemoveWishlist = async (id) => {
    try {
      await accountAPI.removeFromWishlist(id);
      setWishlist(prev => prev.filter(item => item.id !== id));
      success('Item removed from wishlist');
    } catch (err) {
      error('Failed to remove item');
    }
  };

  // Traveller Save/Edit/Delete
  const handleSaveTraveller = async (e) => {
    e.preventDefault();
    try {
      if (editingTraveller) {
        const res = await accountAPI.updateTraveller(editingTraveller.id, travellerForm);
        setTravellers(prev => prev.map(t => t.id === editingTraveller.id ? res.data.traveller : t));
        success('Traveller details updated');
      } else {
        const res = await accountAPI.addTraveller(travellerForm);
        setTravellers(prev => [...prev, res.data.traveller]);
        success('Traveller added successfully');
      }
      setTravellerModalOpen(false);
      setEditingTraveller(null);
    } catch (err) {
      error(err.response?.data?.error || 'Failed to save traveller');
    }
  };

  const handleDeleteTraveller = async (id) => {
    if (!window.confirm('Delete this traveller profile?')) return;
    try {
      await accountAPI.deleteTraveller(id);
      setTravellers(prev => prev.filter(t => t.id !== id));
      success('Traveller deleted');
    } catch (err) {
      error(err.response?.data?.error || 'Failed to delete');
    }
  };

  // Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return error('New passwords do not match');
    }
    if (passwordForm.new_password.length < 8) {
      return error('Password must be at least 8 characters');
    }
    setChangingPassword(true);
    try {
      await accountAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      success('Password changed successfully! A security alert was logged.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      error(err.response?.data?.error || 'Password update failed');
    } finally {
      setChangingPassword(false);
    }
  };

  // Account Deletion
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await accountAPI.deleteAccount({ password_confirmation: deletePassword });
      alert('Your account has been deactivated. You will now be logged out.');
      await logout();
      navigate('/');
    } catch (err) {
      error(err.response?.data?.error || 'Failed to delete account');
      setDeletingAccount(false);
    }
  };

  // Preferences Save
  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await accountAPI.updateProfile({
        language: profileForm.language,
        currency: profileForm.currency,
        notification_preferences: prefForm
      });
      success('Preferences updated!');
      if (res.data.user) setUser(res.data.user);
    } catch (err) {
      error('Failed to update preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  // Support Ticket Actions
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmittingTicket(true);
    try {
      const res = await accountAPI.createTicket(newTicketForm);
      success('Support ticket submitted successfully!');
      setTickets(prev => [res.data.ticket, ...prev]);
      setActiveTicket({ ticket: res.data.ticket, messages: res.data.messages });
      setTicketModalOpen(false);
      setNewTicketForm({ category: 'booking_inquiry', subject: '', message: '', booking_reference: '', priority: 'normal' });
    } catch (err) {
      error(err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleOpenTicketThread = async (ticket) => {
    try {
      const res = await accountAPI.getTicketDetails(ticket.id);
      setActiveTicket(res.data);
    } catch (err) {
      error('Failed to open ticket conversation');
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;
    setSubmittingReply(true);
    try {
      const res = await accountAPI.replyTicket(activeTicket.ticket.id, { message: replyMessage });
      setActiveTicket(res.data);
      setReplyMessage('');
      success('Reply sent to support concierge');
    } catch (err) {
      error('Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await accountAPI.updateTicketStatus(ticketId, 'closed');
      success('Ticket closed');
      loadTickets();
      if (activeTicket?.ticket?.id === ticketId) {
        setActiveTicket(prev => ({ ...prev, ticket: { ...prev.ticket, status: 'closed' } }));
      }
    } catch (err) {
      error('Failed to update ticket status');
    }
  };

  // ──────────────────────────────────────────
  // FILTERED BOOKINGS
  // ──────────────────────────────────────────
  const filteredBookings = bookings.filter(b => {
    // Status filter
    if (bookingFilter === 'upcoming') {
      const isPast = new Date(b.check_out || b.check_in) < new Date();
      if (isPast || b.status === 'cancelled') return false;
    } else if (bookingFilter === 'completed') {
      const isPast = new Date(b.check_out || b.check_in) < new Date();
      if (!isPast || b.status === 'cancelled') return false;
    } else if (bookingFilter === 'cancelled') {
      if (b.status !== 'cancelled') return false;
    } else if (bookingFilter === 'pending') {
      if (b.status !== 'pending') return false;
    }

    // Category filter
    if (bookingCategory !== 'all') {
      if ((b.booking_type || 'package').toLowerCase() !== bookingCategory.toLowerCase()) return false;
    }

    // Search query
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const matchRef = b.reference_number?.toLowerCase().includes(q);
      const matchDest = b.dest_name?.toLowerCase().includes(q) || b.dest_country?.toLowerCase().includes(q);
      const matchPkg = b.package_name?.toLowerCase().includes(q) || b.hotel_name?.toLowerCase().includes(q);
      if (!matchRef && !matchDest && !matchPkg) return false;
    }

    return true;
  });

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '1280px', minHeight: '80vh' }}>
      {/* Top Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            fontSize: '3rem',
            background: '#f1f5f9',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e2e8f0'
          }}>
            {user?.avatar_url || '🏔️'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                {user?.full_name || 'Traveler Account'}
              </h1>
              {user?.role === 'admin' && (
                <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>
                  Admin Concierge
                </span>
              )}
              {user?.provider === 'google' && (
                <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                  Google Verified
                </span>
              )}
            </div>
            <p style={{ margin: '0.35rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              {user?.email} ∙ Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/search" className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.6rem 1.25rem', fontWeight: 700 }}>
            Book Next Trip ⚡
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="btn"
            style={{
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#dc2626',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Account Shell: Sidebar + Content Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }} className="account-grid-responsive">
        {/* Sidebar Navigation */}
        <aside style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', padding: '0.5rem 0.75rem', marginBottom: '0.25rem' }}>
            Account Management
          </div>

          {[
            { id: 'profile', icon: '👤', label: 'Personal Profile' },
            { id: 'bookings', icon: '🧳', label: 'My Trips & Bookings', count: bookings.length },
            { id: 'wishlist', icon: '❤️', label: 'Wishlist & Saved Places', count: wishlist.length },
            { id: 'travellers', icon: '👥', label: 'Saved Travellers', count: travellers.length },
            { id: 'security', icon: '🛡️', label: 'Login & Security' },
            { id: 'preferences', icon: '🔔', label: 'Notifications & Preferences' },
            { id: 'support', icon: '💬', label: 'Help & Support', count: tickets.filter(t => t.status !== 'closed').length },
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? '#f0fdf4' : 'transparent',
                  color: isActive ? '#15803d' : '#334155',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '0.25rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    background: isActive ? '#dcfce7' : '#f1f5f9',
                    color: isActive ? '#166534' : '#64748b',
                    fontWeight: 700
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Pane */}
        <main style={{ minHeight: '500px' }}>
          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 1: PERSONAL PROFILE                                      */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Personal Profile</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Manage your traveler identity, contact details, and display preferences.
                  </p>
                </div>
                <div className="badge" style={{ background: '#ecfdf5', color: '#059669', fontWeight: 600 }}>
                  Active Profile
                </div>
              </div>

              <form onSubmit={handleSaveProfile}>
                {/* Avatar Presets */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label className="label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                    Choose Profile Emblem
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {avatarPresets.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, avatar_url: preset })}
                        style={{
                          fontSize: '1.5rem',
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          border: profileForm.avatar_url === preset ? '2px solid #16a34a' : '1px solid #e2e8f0',
                          background: profileForm.avatar_url === preset ? '#dcfce7' : '#f8fafc',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  {/* Full Name */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontWeight: 700 }}>Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={profileForm.full_name}
                      onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      required
                      placeholder="e.g. Alex Traveler"
                    />
                  </div>

                  {/* Username */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontWeight: 700 }}>Traveler Alias (Username)</label>
                    <input
                      type="text"
                      className="input"
                      value={profileForm.username}
                      onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder="e.g. explorer_alex"
                    />
                  </div>
                </div>

                {/* Email Address (Protected against arbitrary overwrite) */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="label" style={{ fontWeight: 700 }}>Verified Email Address</label>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                      🔒 Protected Identity
                    </span>
                  </div>
                  <input
                    type="email"
                    className="input"
                    value={user?.email || ''}
                    disabled
                    style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                    To preserve Google OAuth and account security, verified email addresses cannot be altered directly in profile form.
                  </small>
                </div>

                {/* Phone Number with Twilio SMS Verification */}
                <div style={{ marginBottom: '1.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="label" style={{ fontWeight: 700, margin: 0 }}>
                      📱 Phone Number (SMS & Itinerary Alerts)
                    </label>
                    {user?.phone_verified ? (
                      <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                        ✓ Verified via Twilio SMS
                      </span>
                    ) : (
                      <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>
                        ⚠️ Verification Pending
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="tel"
                      className="input"
                      value={user?.phone || 'No phone registered'}
                      disabled
                      style={{ flex: 1, minWidth: '220px', background: '#ffffff' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPhoneModalOpen(true)}
                      className="btn"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '0.65rem 1.25rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: '#0f172a'
                      }}
                    >
                      {user?.phone ? 'Update / Verify Phone' : '+ Add Verified Phone'}
                    </button>
                  </div>
                </div>

                {/* Language & Currency Preferences */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontWeight: 700 }}>Preferred Language</label>
                    <select
                      className="input"
                      value={profileForm.language}
                      onChange={e => setProfileForm({ ...profileForm, language: e.target.value })}
                    >
                      <option value="en">English (US/UK)</option>
                      <option value="fr">Français (French)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="ja">日本語 (Japanese)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label" style={{ fontWeight: 700 }}>Display Currency</label>
                    <select
                      className="input"
                      value={profileForm.currency}
                      onChange={e => setProfileForm({ ...profileForm, currency: e.target.value })}
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                      <option value="CAD">CAD ($) - Canadian Dollar</option>
                      <option value="AUD">AUD ($) - Australian Dollar</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', padding: '0.75rem 2rem', fontWeight: 700 }}
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 2: MY TRIPS & BOOKINGS                                   */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'bookings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Filter & Search Bar */}
              <div style={{
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {/* Status Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All Trips' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'cancelled', label: 'Cancelled' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setBookingFilter(tab.id)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '999px',
                        border: '1px solid',
                        borderColor: bookingFilter === tab.id ? '#16a34a' : '#e2e8f0',
                        background: bookingFilter === tab.id ? '#dcfce7' : '#ffffff',
                        color: bookingFilter === tab.id ? '#15803d' : '#64748b',
                        fontWeight: bookingFilter === tab.id ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <input
                  type="text"
                  placeholder="Search by reference or destination..."
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    minWidth: '240px'
                  }}
                />
              </div>

              {/* Bookings List */}
              {loadingBookings ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                  Loading reservations...
                </div>
              ) : filteredBookings.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  padding: '4rem 2rem',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧳</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                    No matching travel bookings found
                  </h3>
                  <p style={{ color: '#64748b', margin: '0 0 1.5rem 0' }}>
                    Ready to discover your next adventure? Explore curated tours and verified hotels.
                  </p>
                  <Link to="/search" className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.65rem 1.5rem' }}>
                    Explore Travel Inventory
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredBookings.map(b => {
                    const isExternal = b.booking_type === 'external';
                    const isCancelled = b.status === 'cancelled';
                    return (
                      <div
                        key={b.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '20px',
                          border: '1px solid #e2e8f0',
                          padding: '1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1.25rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '260px' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#334155'
                            }}>
                              Ref #{b.reference_number || `TIMS-${b.id}`}
                            </span>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: isExternal ? '#e0f2fe' : '#dcfce7',
                              color: isExternal ? '#0369a1' : '#15803d'
                            }}>
                              {isExternal ? '↗ Partner Booking' : '⚡ TIMS Direct'}
                            </span>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: isCancelled ? '#fee2e2' : '#f0fdf4',
                              color: isCancelled ? '#b91c1c' : '#166534'
                            }}>
                              {b.status.toUpperCase()}
                            </span>
                          </div>

                          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                            {b.package_name || b.hotel_name || `${b.dest_name || 'Travel Journey'}`}
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                            📍 {b.dest_name ? `${b.dest_name}, ${b.dest_country || ''}` : 'Confirmed Travel Route'} ∙ 📅 {b.check_in} to {b.check_out} ∙ 👥 {b.travelers} Traveler(s)
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Total Paid</span>
                            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                              ${b.total_price}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="btn"
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '10px',
                                padding: '0.55rem 1rem',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                            >
                              Details
                            </button>

                            {!isCancelled && !isExternal && (
                              <button
                                onClick={async () => {
                                  if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                                  try {
                                    await bookingsAPI.cancel(b.id);
                                    success('Booking cancelled successfully');
                                    loadBookings();
                                  } catch (err) {
                                    error(err.response?.data?.error || 'Failed to cancel');
                                  }
                                }}
                                className="btn"
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #fecaca',
                                  color: '#dc2626',
                                  borderRadius: '10px',
                                  padding: '0.55rem 1rem',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 3: WISHLIST & SAVED PLACES                               */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'wishlist' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Saved Places & Wishlist</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Quickly revisit your dream destinations, luxury stays, and curated holiday packages.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['all', 'destination', 'hotel', 'package'].map(type => (
                    <button
                      key={type}
                      onClick={() => setWishlistTypeFilter(type)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '999px',
                        border: '1px solid #e2e8f0',
                        background: wishlistTypeFilter === type ? '#18181b' : '#ffffff',
                        color: wishlistTypeFilter === type ? '#ffffff' : '#64748b',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {loadingWishlist ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading saved places...</div>
              ) : wishlist.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  padding: '4rem 2rem',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Your wishlist is empty</h3>
                  <p style={{ color: '#64748b', margin: '0 0 1.5rem 0' }}>
                    Click the bookmark or heart icon when exploring destinations or packages to save them here.
                  </p>
                  <Link to="/packages" className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.65rem 1.5rem' }}>
                    Discover Packages
                  </Link>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {wishlist
                    .filter(item => wishlistTypeFilter === 'all' || item.item_type === wishlistTypeFilter)
                    .map(item => (
                      <div
                        key={item.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '20px',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ height: '170px', position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
                          <img
                            src={item.image_url || '/images/placeholder.svg'}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.currentTarget.src = '/images/placeholder.svg'; }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backdropFilter: 'blur(4px)'
                          }}>
                            {item.item_type.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleRemoveWishlist(item.id)}
                            title="Remove from wishlist"
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: '#ffffff',
                              border: 'none',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {item.title}
                            </h4>
                            {item.subtitle && (
                              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#64748b' }}>
                                {item.subtitle}
                              </p>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                            <div>
                              {item.price && (
                                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                                  ${item.price}
                                </span>
                              )}
                            </div>
                            <Link
                              to={item.link_url || `/search?q=${encodeURIComponent(item.title)}`}
                              className="btn btn-primary"
                              style={{ borderRadius: '10px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                            >
                              Explore →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 4: SAVED TRAVELLERS                                      */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'travellers' && (
            <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Saved Travellers</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Save details for family and travel companions for fast booking autofill.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingTraveller(null);
                    setTravellerForm({
                      first_name: '',
                      last_name: '',
                      date_of_birth: '',
                      gender: 'unspecified',
                      traveler_type: 'adult',
                      phone: '',
                      email: '',
                      meal_or_dietary: 'None',
                      special_assistance: '',
                      is_primary: 0
                    });
                    setTravellerModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', padding: '0.6rem 1.25rem', fontWeight: 700 }}
                >
                  + Add New Traveller
                </button>
              </div>

              {loadingTravellers ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading travellers...</div>
              ) : travellers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>No saved travellers yet</h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Add companions once to skip retyping passenger information during flight and package checkouts.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {travellers.map(t => (
                    <div
                      key={t.id}
                      style={{
                        background: '#f8fafc',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: '#e2e8f0',
                            color: '#334155'
                          }}>
                            {t.traveler_type.toUpperCase()}
                          </span>
                          {t.is_primary === 1 && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                              ★ Primary Traveler
                            </span>
                          )}
                        </div>

                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                          {t.first_name} {t.last_name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                          Gender: {t.gender} <br />
                          {t.date_of_birth && `DOB: ${t.date_of_birth} ∙ `}
                          Dietary: {t.meal_or_dietary || 'None'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                        <button
                          onClick={() => {
                            setEditingTraveller(t);
                            setTravellerForm(t);
                            setTravellerModalOpen(true);
                          }}
                          className="btn"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTraveller(t.id)}
                          className="btn"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 5: LOGIN & SECURITY                                      */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Security Overview Card */}
              <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem', fontWeight: 800 }}>Account Security Status</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Authentication Method</span>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                      {user?.provider === 'google' ? 'Google OAuth 2.0' : 'Local Password'}
                    </strong>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Email Verification</span>
                    <strong style={{ fontSize: '1.05rem', color: user?.email_verified ? '#16a34a' : '#b45309' }}>
                      {user?.email_verified ? '✓ Verified' : '⚠️ Pending'}
                    </strong>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>SMS 2FA Gateway</span>
                    <strong style={{ fontSize: '1.05rem', color: user?.phone_verified ? '#16a34a' : '#64748b' }}>
                      {user?.phone_verified ? '✓ Active via Twilio' : 'Optional (Unverified)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Password Change (Local Users Only) */}
              {user?.provider === 'local' && (
                <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Change Password</h3>
                  <form onSubmit={handleChangePassword}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="label" style={{ fontWeight: 700 }}>Current Password</label>
                        <input
                          type="password"
                          className="input"
                          value={passwordForm.current_password}
                          onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="label" style={{ fontWeight: 700 }}>New Password (min 8 chars)</label>
                        <input
                          type="password"
                          className="input"
                          value={passwordForm.new_password}
                          onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                      <label className="label" style={{ fontWeight: 700 }}>Confirm New Password</label>
                      <input
                        type="password"
                        className="input"
                        value={passwordForm.confirm_password}
                        onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        required
                        minLength={8}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="btn btn-primary"
                      style={{ borderRadius: '12px', padding: '0.65rem 1.5rem', fontWeight: 700 }}
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Deactivate Account */}
              <div className="card" style={{ padding: '2rem', background: '#fff5f5', borderRadius: '24px', border: '1px solid #fed7d7' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#c53030', fontSize: '1.2rem', fontWeight: 800 }}>
                  Deactivate Account
                </h3>
                <p style={{ color: '#742a2a', fontSize: '0.88rem', margin: '0 0 1.25rem 0' }}>
                  Deactivating your account will anonymize your personal credentials and remove all saved preferences and wishlists. Historical financial bookings remain securely archived for accounting compliance.
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="btn"
                  style={{
                    background: '#e53e3e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.65rem 1.25rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Request Account Deactivation
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 6: NOTIFICATIONS & PREFERENCES                           */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Notification Channels & Alerts</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                  Choose how and when you receive travel alerts, confirmations, and security notices.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                  {
                    key: 'booking_updates',
                    title: 'Essential Booking Notifications',
                    desc: 'Instant booking confirmations, itinerary vouchers, and hotel check-in details (Required for trip safety).'
                  },
                  {
                    key: 'sms_alerts',
                    title: 'Twilio SMS Real-Time Alerts',
                    desc: 'Emergency route updates, gate changes, and verification security passcodes sent to your verified mobile number.'
                  },
                  {
                    key: 'travel_reminders',
                    title: 'Pre-Trip Reminders & Itinerary Tips',
                    desc: 'Helpful reminders 24 hours prior to departure, destination weather alerts, and packing guides.'
                  },
                  {
                    key: 'promotions',
                    title: 'Promotional Offers & Early-Bird Deals',
                    desc: 'Exclusive member discounts, seasonal vacation package sales, and partner airline flash deals.'
                  }
                ].map(item => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.98rem', color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>
                        {item.title}
                      </strong>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.83rem' }}>{item.desc}</p>
                    </div>

                    <input
                      type="checkbox"
                      checked={!!prefForm[item.key]}
                      onChange={e => setPrefForm({ ...prefForm, [item.key]: e.target.checked })}
                      style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#16a34a' }}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '0.75rem 2rem', fontWeight: 700 }}
              >
                {savingPrefs ? 'Saving...' : 'Save Notification Preferences'}
              </button>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 7: HELP & SUPPORT                                        */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Support Header & FAQs */}
              <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Traveler Concierge & Help</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                      Get support for bookings, cancellations, itinerary questions, and account assistance.
                    </p>
                  </div>
                  <button
                    onClick={() => setTicketModalOpen(true)}
                    className="btn btn-primary"
                    style={{ borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: 700 }}
                  >
                    + Submit Support Request
                  </button>
                </div>

                {/* Quick FAQs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {[
                    { q: 'How do I cancel my tour package?', a: 'Direct TIMS bookings can be cancelled with one click from the My Trips tab before the departure window.' },
                    { q: 'What about External Partner bookings?', a: 'External bookings made on MakeMyTrip or IRCTC are serviced directly by the partner using your provided reference.' },
                    { q: 'Can I add extra travelers?', a: 'Yes! Save traveler profiles in the Saved Travellers tab or message our concierge below.' }
                  ].map((faq, i) => (
                    <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                        {faq.q}
                      </strong>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tickets Tracker */}
              <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Your Support Requests</h3>

                {loadingTickets ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading tickets...</div>
                ) : tickets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '16px' }}>
                    <p style={{ margin: 0, color: '#64748b' }}>No active or past support tickets logged.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {tickets.map(t => (
                      <div
                        key={t.id}
                        style={{
                          background: '#f8fafc',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          padding: '1.25rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1e293b' }}>
                              #{t.ticket_number}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              background: t.status === 'open' ? '#dbeafe' : t.status === 'resolved' ? '#dcfce7' : t.status === 'closed' ? '#f1f5f9' : '#fef3c7',
                              color: t.status === 'open' ? '#1d4ed8' : t.status === 'resolved' ? '#15803d' : t.status === 'closed' ? '#64748b' : '#b45309'
                            }}>
                              {t.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            {t.booking_reference && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Ref: {t.booking_reference}
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            {t.subject}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Logged on {new Date(t.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenTicketThread(t)}
                            className="btn btn-primary"
                            style={{ borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            View Conversation →
                          </button>
                          {t.status !== 'closed' && (
                            <button
                              onClick={() => handleCloseTicket(t.id)}
                              className="btn"
                              style={{
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '10px',
                                padding: '0.5rem 0.85rem',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Conversation Drawer / Modal */}
              {activeTicket && (
                <div style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '2px solid #2563eb',
                  padding: '2rem',
                  boxShadow: '0 10px 30px rgba(37,99,235,0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>
                        Ticket #{activeTicket.ticket.ticket_number}
                      </span>
                      <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>
                        {activeTicket.ticket.subject}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTicket(null)}
                      style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Messages Thread */}
                  <div style={{
                    maxHeight: '340px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                    padding: '0.5rem'
                  }}>
                    {activeTicket.messages?.map(m => {
                      const isSupport = m.sender_type === 'support';
                      return (
                        <div
                          key={m.id}
                          style={{
                            alignSelf: isSupport ? 'flex-start' : 'flex-end',
                            maxWidth: '80%',
                            background: isSupport ? '#f1f5f9' : '#dcfce7',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: isSupport ? '#e2e8f0' : '#bbf7d0'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.82rem', color: isSupport ? '#1e293b' : '#166534' }}>
                              {m.sender_name} {isSupport && '🛡️'}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.4 }}>
                            {m.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Form */}
                  {activeTicket.ticket.status !== 'closed' ? (
                    <form onSubmit={handleReplyTicket} style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder="Write reply to concierge support..."
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        className="input"
                        style={{ flex: 1, margin: 0 }}
                        required
                      />
                      <button
                        type="submit"
                        disabled={submittingReply}
                        className="btn btn-primary"
                        style={{ borderRadius: '12px', padding: '0.65rem 1.5rem', fontWeight: 700 }}
                      >
                        {submittingReply ? 'Sending...' : 'Reply'}
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '0.85rem' }}>
                      This ticket is closed. Submit a new support request if you require further assistance.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 1: TWILIO SMS PHONE VERIFICATION                      */}
      {/* ──────────────────────────────────────────────────────────── */}
      {phoneModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                📱 Twilio SMS Verification
              </h3>
              <button onClick={() => setPhoneModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.25rem 0' }}>
              We will send a cryptographically secure 6-digit one-time code to verify your phone number for itinerary updates.
            </p>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label" style={{ fontWeight: 700 }}>Phone Number (with Country Code)</label>
              <input
                type="tel"
                className="input"
                placeholder="+15552345678"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                disabled={otpSent}
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={sendingOtp}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', fontWeight: 700 }}
              >
                {sendingOtp ? 'Sending SMS Code...' : 'Send Verification SMS Code'}
              </button>
            ) : (
              <div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="label" style={{ fontWeight: 700 }}>Enter 6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="input"
                    placeholder="123456"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    style={{ fontSize: '1.4rem', letterSpacing: '4px', textAlign: 'center' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    disabled={verifyingOtp}
                    className="btn btn-primary"
                    style={{ flex: 1, borderRadius: '12px', padding: '0.75rem', fontWeight: 700 }}
                  >
                    {verifyingOtp ? 'Verifying...' : 'Confirm & Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="btn"
                    style={{ borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1' }}
                  >
                    Edit Phone
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 2: ADD / EDIT TRAVELLER                                */}
      {/* ──────────────────────────────────────────────────────────── */}
      {travellerModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                {editingTraveller ? 'Edit Traveller Profile' : 'Add Travel Companion'}
              </h3>
              <button onClick={() => setTravellerModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTraveller}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontWeight: 700 }}>First Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={travellerForm.first_name}
                    onChange={e => setTravellerForm({ ...travellerForm, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontWeight: 700 }}>Last Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={travellerForm.last_name}
                    onChange={e => setTravellerForm({ ...travellerForm, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontWeight: 700 }}>Date of Birth</label>
                  <input
                    type="date"
                    className="input"
                    value={travellerForm.date_of_birth || ''}
                    onChange={e => setTravellerForm({ ...travellerForm, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontWeight: 700 }}>Gender</label>
                  <select
                    className="input"
                    value={travellerForm.gender || 'unspecified'}
                    onChange={e => setTravellerForm({ ...travellerForm, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unspecified">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontWeight: 700 }}>Traveler Category</label>
                  <select
                    className="input"
                    value={travellerForm.traveler_type || 'adult'}
                    onChange={e => setTravellerForm({ ...travellerForm, traveler_type: e.target.value })}
                  >
                    <option value="adult">Adult (12+ yrs)</option>
                    <option value="child">Child (2 - 11 yrs)</option>
                    <option value="infant">Infant (Under 2 yrs)</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontWeight: 700 }}>Dietary Preference</label>
                  <select
                    className="input"
                    value={travellerForm.meal_or_dietary || 'None'}
                    onChange={e => setTravellerForm({ ...travellerForm, meal_or_dietary: e.target.value })}
                  >
                    <option value="None">Standard / No Preference</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="label" style={{ fontWeight: 700 }}>Special Assistance (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Wheelchair assistance, extra legroom"
                  className="input"
                  value={travellerForm.special_assistance || ''}
                  onChange={e => setTravellerForm({ ...travellerForm, special_assistance: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="is_primary_checkbox"
                  checked={travellerForm.is_primary === 1}
                  onChange={e => setTravellerForm({ ...travellerForm, is_primary: e.target.checked ? 1 : 0 })}
                  style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
                />
                <label htmlFor="is_primary_checkbox" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                  Set as primary travel contact
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', fontWeight: 700 }}>
                {editingTraveller ? 'Update Traveller' : 'Save Traveller'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 3: SUBMIT NEW SUPPORT TICKET                           */}
      {/* ──────────────────────────────────────────────────────────── */}
      {ticketModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Submit Support Request</h3>
              <button onClick={() => setTicketModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontWeight: 700 }}>Category *</label>
                  <select
                    className="input"
                    value={newTicketForm.category}
                    onChange={e => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  >
                    <option value="booking_inquiry">Booking Inquiry</option>
                    <option value="cancellation">Cancellation & Refund</option>
                    <option value="flight_hotel_support">Flight / Hotel Support</option>
                    <option value="technical_issue">Technical Issue</option>
                    <option value="account_security">Account & Security</option>
                    <option value="other">General Feedback</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label" style={{ fontWeight: 700 }}>Priority</label>
                  <select
                    className="input"
                    value={newTicketForm.priority}
                    onChange={e => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Upcoming Trip)</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="label" style={{ fontWeight: 700 }}>Attach Booking Reference (Optional)</label>
                <select
                  className="input"
                  value={newTicketForm.booking_reference}
                  onChange={e => setNewTicketForm({ ...newTicketForm, booking_reference: e.target.value })}
                >
                  <option value="">None / General Inquiry</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.reference_number || `TIMS-${b.id}`}>
                      {b.reference_number || `TIMS-${b.id}`} - {b.package_name || b.dest_name || 'Reservation'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="label" style={{ fontWeight: 700 }}>Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. Question regarding hotel breakfast inclusion"
                  className="input"
                  value={newTicketForm.subject}
                  onChange={e => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="label" style={{ fontWeight: 700 }}>Message Details *</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  className="input"
                  value={newTicketForm.message}
                  onChange={e => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', fontWeight: 700 }}
              >
                {submittingTicket ? 'Submitting...' : 'Submit Support Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 4: BOOKING DETAILS POPUP                               */}
      {/* ──────────────────────────────────────────────────────────── */}
      {selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '520px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
                  Confirmed Travel Voucher
                </span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>
                  Ref #{selectedBooking.reference_number || `TIMS-${selectedBooking.id}`}
                </h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>RESERVATION FOR</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                  {selectedBooking.package_name || selectedBooking.hotel_name || selectedBooking.dest_name}
                </strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Check-In:</span>
                  <strong>{selectedBooking.check_in}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Check-Out:</span>
                  <strong>{selectedBooking.check_out}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Travelers:</span>
                  <strong>{selectedBooking.travelers} Guests</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Provider:</span>
                  <strong>{selectedBooking.provider_code || 'TIMS Direct'}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Total Paid</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  ${selectedBooking.total_price}
                </span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="btn btn-primary" style={{ borderRadius: '10px', padding: '0.5rem 1.25rem' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 5: ACCOUNT DELETION CONFIRMATION                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '460px',
            width: '100%'
          }}>
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#c53030', fontSize: '1.3rem', fontWeight: 800 }}>
              Confirm Account Deactivation
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.25rem 0' }}>
              Are you sure you want to proceed? Your personal profile, wishlist, and traveler companions will be permanently deleted.
            </p>

            {user?.provider === 'local' && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="label" style={{ fontWeight: 700 }}>Enter your password to confirm</label>
                <input
                  type="password"
                  className="input"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="btn"
                style={{
                  flex: 1,
                  background: '#e53e3e',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {deletingAccount ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="btn"
                style={{ borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

