import { useState, useEffect } from 'react';
import { reportsAPI, bookingsAPI, usersAPI, travelAPI, accountAPI, destinationsAPI, hotelsAPI, packagesAPI } from '../api/client';
import { useAuth } from '../features/auth/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from '../components/ui/ToastContext';
import {
  IconAdminOffice,
  IconQuickAction,
  IconFlight,
  IconGlobe,
  IconLocationPin,
  IconHotel,
  IconHolidayPackage,
  NavTravellers,
  IconShieldTrust,
  getAvatarComponent
} from '../components/ui/Icons';

const CHART_COLORS = ['#083c6b', '#00b4d8', '#2a9df4', '#85c1e9', '#0d9f6e', '#d97706', '#dc2626', '#dce7f5'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  // Data State
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [packages, setPackages] = useState([]);

  // Ticket Reply & Interactive State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Search Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for CRUD
  const [destModal, setDestModal] = useState({ open: false, isEditing: false, data: {} });
  const [hotelModal, setHotelModal] = useState({ open: false, isEditing: false, data: {} });
  const [packageModal, setPackageModal] = useState({ open: false, isEditing: false, data: {} });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, revRes, occRes, bookRes, userRes, provRes, auditRes, tktRes, destRes, hotRes, pkgRes] = await Promise.all([
        reportsAPI.summary(),
        reportsAPI.revenue(),
        reportsAPI.occupancy(),
        bookingsAPI.list({ limit: 50 }),
        usersAPI.list(),
        travelAPI.providers().catch(() => ({ data: { providers: [] } })),
        travelAPI.auditLogs({ limit: 50 }).catch(() => ({ data: { logs: [] } })),
        accountAPI.adminListTickets().catch(() => ({ data: { tickets: [] } })),
        destinationsAPI.list({ limit: 100 }).catch(() => ({ data: { destinations: [] } })),
        hotelsAPI.list({}).catch(() => ({ data: { hotels: [] } })),
        packagesAPI.list({}).catch(() => ({ data: { packages: [] } }))
      ]);

      setStats(stRes.data.stats);
      setRevenue(revRes.data.data);
      setOccupancy(occRes.data.data.slice(0, 10));
      setBookings(bookRes.data.bookings || []);
      setUsers(userRes.data.users || []);
      setProviders(provRes.data.providers || []);
      setAuditLogs(auditRes.data.logs || []);
      setTickets(tktRes.data.tickets || []);
      setDestinations(destRes.data.destinations || []);
      setHotels(hotRes.data.hotels || []);
      setPackages(pkgRes.data.packages || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      error('Failed to load dashboard data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── BOOKING ACTIONS ───
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking permanently?')) return;
    try {
      await bookingsAPI.cancel(id);
      success('Booking cancelled successfully');
      fetchData();
    } catch (err) {
      error('Failed to cancel booking');
    }
  };

  // ─── USER ACTIONS ───
  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await usersAPI.update(id, { is_active: !currentStatus });
      success(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (err) {
      error('Update failed');
    }
  };

  // ─── DESTINATION CRUD ───
  const handleSaveDestination = async (e) => {
    e.preventDefault();
    try {
      if (destModal.isEditing) {
        await destinationsAPI.update(destModal.data.id, destModal.data);
        success('Destination updated successfully');
      } else {
        await destinationsAPI.create(destModal.data);
        success('New destination created');
      }
      setDestModal({ open: false, isEditing: false, data: {} });
      fetchData();
    } catch (err) {
      error('Failed to save destination');
    }
  };

  const handleDeleteDestination = async (id) => {
    if (!window.confirm('Are you sure you want to remove this destination?')) return;
    try {
      await destinationsAPI.delete(id);
      success('Destination removed');
      fetchData();
    } catch (err) {
      error('Failed to delete destination');
    }
  };

  // ─── HOTEL CRUD ───
  const handleSaveHotel = async (e) => {
    e.preventDefault();
    try {
      if (hotelModal.isEditing) {
        await hotelsAPI.update(hotelModal.data.id, hotelModal.data);
        success('Hotel details updated');
      } else {
        await hotelsAPI.create(hotelModal.data);
        success('Hotel added to catalog');
      }
      setHotelModal({ open: false, isEditing: false, data: {} });
      fetchData();
    } catch (err) {
      error('Failed to save hotel');
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Delete this hotel property from TIMS?')) return;
    try {
      await hotelsAPI.delete(id);
      success('Hotel deleted');
      fetchData();
    } catch (err) {
      error('Failed to delete hotel');
    }
  };

  // ─── PACKAGE CRUD ───
  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      if (packageModal.isEditing) {
        await packagesAPI.update(packageModal.data.id, packageModal.data);
        success('Tour package updated');
      } else {
        await packagesAPI.create(packageModal.data);
        success('Tour package published');
      }
      setPackageModal({ open: false, isEditing: false, data: {} });
      fetchData();
    } catch (err) {
      error('Failed to save package');
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this tour package?')) return;
    try {
      await packagesAPI.delete(id);
      success('Package deleted');
      fetchData();
    } catch (err) {
      error('Failed to delete package');
    }
  };

  if (loading || !stats) {
    return (
      <div className="container page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="splash-bar mx-auto" style={{ width: '200px', height: '4px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: '#059669', animation: 'pulse 1.5s infinite' }}></div>
          </div>
          <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Loading TIMS Executive Control Console...</p>
        </div>
      </div>
    );
  }

  // Filtered Lists
  const filteredDestinations = destinations.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHotels = hotels.filter(h =>
    h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.dest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = packages.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hotel_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    b.id?.toString().includes(searchQuery) ||
    b.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.dest_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container page" style={{ maxWidth: '1440px', paddingBottom: '4rem' }}>
      {/* ─── HEADER BAR ─── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div className="badge-pill" style={{ marginBottom: '0.4rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
            <IconAdminOffice size={15} /> Executive Command Suite
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem 0' }}>TIMS Administrator Console</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Unified management for destinations, hotel properties, tour packages, client bookings, and partner travel networks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={fetchData} className="btn" style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontSize: '0.88rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            ↻ Refresh Data
          </button>
        </div>
      </div>

      {/* ─── NAVIGATION TABS WITH ITEM BADGES ─── */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #e2e8f0',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: IconQuickAction },
          { id: 'destinations', label: 'Destinations', count: destinations.length, icon: IconLocationPin },
          { id: 'hotels', label: 'Hotels', count: hotels.length, icon: IconHotel },
          { id: 'packages', label: 'Packages', count: packages.length, icon: IconHolidayPackage },
          { id: 'bookings', label: 'Bookings', count: bookings.length, icon: IconFlight },
          { id: 'tickets', label: 'Support Tickets', count: tickets.filter(t => t.status !== 'closed').length, badgeColor: '#ef4444', icon: NavTravellers },
          { id: 'providers', label: 'Integrations', count: providers.length || 6, icon: IconGlobe },
          { id: 'audit', label: 'Audit Logs', count: auditLogs.length, icon: IconShieldTrust },
          { id: 'users', label: 'User Directory', count: users.length, icon: NavTravellers }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const IconCmp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid #059669' : '3px solid transparent',
                color: isActive ? '#059669' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <IconCmp size={18} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: isActive ? '#d1fae5' : (tab.badgeColor ? '#fee2e2' : '#f1f5f9'),
                  color: isActive ? '#065f46' : (tab.badgeColor ? '#991b1b' : '#64748b'),
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: OVERVIEW & ANALYTICS ─── */}
      {activeTab === 'overview' && (
        <div className="animation-fade">
          <div className="grid grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { Icon: IconQuickAction, label: 'Gross Revenue', value: '$' + (stats.total_revenue || 0).toLocaleString(), color: '#047857' },
              { Icon: IconFlight, label: 'Active Bookings', value: stats.active_bookings || 0, color: '#0284c7' },
              { Icon: IconLocationPin, label: 'Destinations', value: destinations.length, color: '#d97706' },
              { Icon: IconHotel, label: 'Hotel Properties', value: hotels.length, color: '#6366f1' },
              { Icon: IconHolidayPackage, label: 'Tour Packages', value: packages.length, color: '#ec4899' },
              { Icon: NavTravellers, label: 'Registered Clients', value: stats.total_users || users.length, color: '#0f766e' },
              { Icon: IconGlobe, label: 'Countries Covered', value: stats.total_countries || 250, color: '#0284c7' },
              { Icon: IconAdminOffice, label: 'Live Travel APIs', value: providers.length || 6, color: '#059669' }
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</span>
                  <div style={{ padding: '6px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <s.Icon size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Monthly Revenue Trajectory</h3>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} dot={{ fill: '#059669', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Top Hotel Occupancy Rates</h3>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancy} margin={{ bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="hotel_name" stroke="#94a3b8" fontSize={11} angle={-20} textAnchor="end" height={50} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                    <Bar dataKey="occupancy_rate" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DESTINATIONS MANAGEMENT ─── */}
      {activeTab === 'destinations' && (
        <div className="animation-fade glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search destinations by name, country, or region..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <button
              onClick={() => setDestModal({ open: true, isEditing: false, data: { name: '', country: '', region: 'Europe', description: '', latitude: 0, longitude: 0, image_url: '', rating: 4.5, best_season: 'All Year' } })}
              className="btn btn-primary"
              style={{ background: '#059669', color: '#ffffff', fontWeight: 600, padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              + Add Destination
            </button>
          </div>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Country</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Region</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Best Season</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDestinations.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {d.image_url ? (
                        <img src={d.image_url} alt="" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📍</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: #{d.id}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{d.country}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{d.region}</span></td>
                    <td style={{ padding: '0.75rem 1rem', color: '#d97706', fontWeight: 700 }}>★ {d.rating}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{d.best_season || 'Anytime'}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setDestModal({ open: true, isEditing: true, data: { ...d } })}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDestination(d.id)}
                        style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: HOTELS MANAGEMENT ─── */}
      {activeTab === 'hotels' && (
        <div className="animation-fade glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search hotels by property name, destination..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <button
              onClick={() => setHotelModal({ open: true, isEditing: false, data: { name: '', dest_id: destinations[0]?.id || 1, category: 'luxury', price_per_night: 250, rating: 4.8, total_rooms: 50, amenities: 'WiFi, Pool, Spa, Breakfast', image_url: '', description: '' } })}
              className="btn btn-primary"
              style={{ background: '#059669', color: '#ffffff', fontWeight: 600, padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              + Add Hotel Property
            </button>
          </div>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Property</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Price / Night</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Inventory</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {h.image_url ? (
                        <img src={h.image_url} alt="" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏨</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{h.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: #{h.id}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{h.dest_name || `Destination #${h.dest_id}`}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>{h.category}</span></td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>${h.price_per_night}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#d97706', fontWeight: 700 }}>★ {h.rating}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{h.total_rooms || 50} rooms</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setHotelModal({ open: true, isEditing: true, data: { ...h } })}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(h.id)}
                        style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: TOUR PACKAGES MANAGEMENT ─── */}
      {activeTab === 'packages' && (
        <div className="animation-fade glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search packages by name, destination, or partner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <button
              onClick={() => setPackageModal({ open: true, isEditing: false, data: { name: '', dest_id: destinations[0]?.id || 1, hotel_id: hotels[0]?.id || 1, description: '', base_price: 999, duration_days: 5, max_group_size: 15, seasonal_multiplier: 1.0, image_url: '' } })}
              className="btn btn-primary"
              style={{ background: '#059669', color: '#ffffff', fontWeight: 600, padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              + Create Tour Package
            </button>
          </div>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Package Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Partner Hotel</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Base Price</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Max Guests</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt="" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎒</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: #{p.id}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{p.dest_name || `Destination #${p.dest_id}`}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{p.hotel_name || `Hotel #${p.hotel_id}`}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{p.duration_days} Days</span></td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#059669' }}>${p.base_price}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{p.max_group_size} travelers</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setPackageModal({ open: true, isEditing: true, data: { ...p } })}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePackage(p.id)}
                        style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 5: DIRECT BOOKINGS ─── */}
      {activeTab === 'bookings' && (
        <div className="animation-fade glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Client Booking Ledger</h2>
            <input
              type="text"
              placeholder="Search by ID, customer name, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '320px', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            />
          </div>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Ref ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Dates</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Travelers</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>#{b.id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.user_name || 'Direct Guest'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{b.user_email || 'guest@tims.com'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{b.dest_name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{b.check_in} → {b.check_out}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{b.travelers} guests</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>${b.total_price}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: b.status === 'confirmed' ? '#dcfce7' : (b.status === 'pending' ? '#fef9c3' : '#fee2e2'),
                        color: b.status === 'confirmed' ? '#15803d' : (b.status === 'pending' ? '#a16207' : '#b91c1c'),
                        textTransform: 'capitalize'
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {b.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 6: SUPPORT TICKETS ─── */}
      {activeTab === 'tickets' && (
        <div className="animation-fade glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Traveler Concierge Tickets</h2>
          <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>Subject</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Priority</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: selectedTicket?.id === t.id ? '#f0fdf4' : 'transparent' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>#{t.id}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{t.subject}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: t.status === 'open' ? '#dbeafe' : (t.status === 'resolved' ? '#dcfce7' : '#f1f5f9'),
                          color: t.status === 'open' ? '#1d4ed8' : (t.status === 'resolved' ? '#15803d' : '#475569')
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textTransform: 'capitalize', color: t.priority === 'urgent' ? '#b91c1c' : '#475569', fontWeight: 600 }}>{t.priority}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => setSelectedTicket(t)}
                          style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          View & Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedTicket && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Ticket #{selectedTicket.id}: {selectedTicket.subject}</h3>
                  <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>✕</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem', background: '#ffffff', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>{selectedTicket.message || selectedTicket.description}</p>
                </div>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    if (!adminReplyText.trim()) return;
                    try {
                      await accountAPI.adminReplyTicket(selectedTicket.id, { message: adminReplyText });
                      success('Reply sent to customer');
                      setAdminReplyText('');
                      fetchData();
                    } catch (err) {
                      error('Failed to send reply');
                    }
                  }}
                  style={{ display: 'flex', gap: '0.5rem' }}
                >
                  <input
                    type="text"
                    placeholder="Type official concierge response..."
                    value={adminReplyText}
                    onChange={e => setAdminReplyText(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    required
                  />
                  <button type="submit" style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 7: TRAVEL INTEGRATIONS ─── */}
      {activeTab === 'providers' && (
        <div className="animation-fade glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Live Travel Aggregator Adapters</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Active upstream search adapters and direct deep-linking gateways.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              { code: 'AMADEUS', name: 'Google Flights & Amadeus', type: 'Flights', status: 'Active', latency: '48ms', deepLink: 'https://www.google.com/travel/flights' },
              { code: 'CONFIRMTKT', name: 'ConfirmTkt & IRCTC', type: 'Trains', status: 'Active', latency: '32ms', deepLink: 'https://www.confirmtkt.com' },
              { code: 'REDBUS', name: 'RedBus & AbhiBus', type: 'Buses', status: 'Active', latency: '29ms', deepLink: 'https://www.redbus.in' },
              { code: 'BOOKING_COM', name: 'Booking.com & Agoda', type: 'Hotels', status: 'Active', latency: '65ms', deepLink: 'https://www.booking.com' },
              { code: 'MAKEMYTRIP', name: 'MakeMyTrip & Tour Packages', type: 'Packages', status: 'Active', latency: '40ms', deepLink: 'https://www.makemytrip.com' },
              { code: 'TIMS_DIRECT', name: 'TIMS Native Inventory Engine', type: 'Direct Booking', status: 'Active', latency: '8ms', deepLink: '/search' }
            ].map((p, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>● {p.status}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ping: {p.latency}</span>
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{p.name}</h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>Category: <strong>{p.type}</strong></div>
                <a href={p.deepLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                  Test Deep-Link Gateway ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 8: AUDIT LOGS ─── */}
      {activeTab === 'audit' && (
        <div className="animation-fade glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Security & Dispatch Audit Trail</h2>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Timestamp</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Event Action</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Target / URL</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>IP Address</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(log.created_at || Date.now()).toLocaleString()}</td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#0f172a' }}>{log.action_type || log.event || 'OUTBOUND_REDIRECT'}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#0284c7', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.target_url || log.details || 'N/A'}</td>
                    <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', color: '#64748b' }}>{log.ip_address || '127.0.0.1'}</td>
                    <td style={{ padding: '0.65rem 0.85rem' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>SUCCESS</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 9: USER DIRECTORY ─── */}
      {activeTab === 'users' && (
        <div className="animation-fade glass-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Registered Traveler Directory</h2>
            <input
              type="text"
              placeholder="Search by passenger name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '300px', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            />
          </div>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Passenger</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getAvatarComponent(u.avatar_url, 24)}
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.full_name}</div>
                        {u.username && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>@{u.username}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{u.role}</span></td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: u.is_active ? '#dcfce7' : '#fee2e2',
                        color: u.is_active ? '#15803d' : '#b91c1c'
                      }}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {u.id !== user.id && (
                        <button
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
                          style={{
                            background: u.is_active ? '#fee2e2' : '#dcfce7',
                            border: `1px solid ${u.is_active ? '#fca5a5' : '#86efac'}`,
                            color: u.is_active ? '#b91c1c' : '#15803d',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 600
                          }}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT DESTINATION ─── */}
      {destModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '540px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{destModal.isEditing ? 'Edit Destination' : 'Add New Destination'}</h3>
              <button onClick={() => setDestModal({ open: false, isEditing: false, data: {} })} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <form onSubmit={handleSaveDestination}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Name *</label>
                  <input
                    type="text"
                    required
                    value={destModal.data.name || ''}
                    onChange={e => setDestModal({ ...destModal, data: { ...destModal.data, name: e.target.value } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Country *</label>
                  <input
                    type="text"
                    required
                    value={destModal.data.country || ''}
                    onChange={e => setDestModal({ ...destModal, data: { ...destModal.data, country: e.target.value } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Region</label>
                  <select
                    value={destModal.data.region || 'Europe'}
                    onChange={e => setDestModal({ ...destModal, data: { ...destModal.data, region: e.target.value } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Americas">Americas</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Africa">Africa</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Rating (1 - 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={destModal.data.rating || 4.5}
                    onChange={e => setDestModal({ ...destModal, data: { ...destModal.data, rating: parseFloat(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={destModal.data.image_url || ''}
                  onChange={e => setDestModal({ ...destModal, data: { ...destModal.data, image_url: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={3}
                  value={destModal.data.description || ''}
                  onChange={e => setDestModal({ ...destModal, data: { ...destModal.data, description: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setDestModal({ open: false, isEditing: false, data: {} })}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                >
                  {destModal.isEditing ? 'Save Changes' : 'Create Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT HOTEL ─── */}
      {hotelModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '540px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{hotelModal.isEditing ? 'Edit Hotel Property' : 'Add Hotel Property'}</h3>
              <button onClick={() => setHotelModal({ open: false, isEditing: false, data: {} })} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <form onSubmit={handleSaveHotel}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Hotel Name *</label>
                <input
                  type="text"
                  required
                  value={hotelModal.data.name || ''}
                  onChange={e => setHotelModal({ ...hotelModal, data: { ...hotelModal.data, name: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Destination *</label>
                  <select
                    value={hotelModal.data.dest_id || destinations[0]?.id}
                    onChange={e => setHotelModal({ ...hotelModal, data: { ...hotelModal.data, dest_id: parseInt(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Category</label>
                  <select
                    value={hotelModal.data.category || 'luxury'}
                    onChange={e => setHotelModal({ ...hotelModal, data: { ...hotelModal.data, category: e.target.value } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="luxury">Luxury</option>
                    <option value="premium">Premium</option>
                    <option value="standard">Standard</option>
                    <option value="budget">Budget</option>
                    <option value="resort">Resort</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Price / Night ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={hotelModal.data.price_per_night || 200}
                    onChange={e => setHotelModal({ ...hotelModal, data: { ...hotelModal.data, price_per_night: parseInt(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Rating (1 - 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={hotelModal.data.rating || 4.8}
                    onChange={e => setHotelModal({ ...hotelModal, data: { ...hotelModal.data, rating: parseFloat(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Rooms</label>
                  <input
                    type="number"
                    min="1"
                    value={hotelModal.data.total_rooms || 50}
                    onChange={e => setHotelModal({ ...hotelModal, data: { ...hotelModal.data, total_rooms: parseInt(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Amenities (comma separated)</label>
                <input
                  type="text"
                  placeholder="Pool, Spa, Restaurant, WiFi, Butler"
                  value={hotelModal.data.amenities || ''}
                  onChange={e => setHotelModal({ ...hotelModal, data: { ...hotelModal.data, amenities: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={hotelModal.data.image_url || ''}
                  onChange={e => setHotelModal({ ...hotelModal, data: { ...hotelModal.data, image_url: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setHotelModal({ open: false, isEditing: false, data: {} })}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                >
                  {hotelModal.isEditing ? 'Save Changes' : 'Add Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT PACKAGE ─── */}
      {packageModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '540px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{packageModal.isEditing ? 'Edit Tour Package' : 'Create Tour Package'}</h3>
              <button onClick={() => setPackageModal({ open: false, isEditing: false, data: {} })} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <form onSubmit={handleSavePackage}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Package Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto Cherry Blossom 5-Day Cultural Tour"
                  value={packageModal.data.name || ''}
                  onChange={e => setPackageModal({ ...packageModal, data: { ...packageModal.data, name: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Destination *</label>
                  <select
                    value={packageModal.data.dest_id || destinations[0]?.id}
                    onChange={e => setPackageModal({ ...packageModal, data: { ...packageModal.data, dest_id: parseInt(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Partner Hotel</label>
                  <select
                    value={packageModal.data.hotel_id || hotels[0]?.id}
                    onChange={e => setPackageModal({ ...packageModal, data: { ...packageModal.data, hotel_id: parseInt(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>{h.name} (${h.price_per_night}/nt)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Base Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={packageModal.data.base_price || 999}
                    onChange={e => setPackageModal({ ...packageModal, data: { ...packageModal.data, base_price: parseInt(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={packageModal.data.duration_days || 5}
                    onChange={e => setPackageModal({ ...packageModal, data: { ...packageModal.data, duration_days: parseInt(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Max Travelers</label>
                  <input
                    type="number"
                    min="1"
                    value={packageModal.data.max_group_size || 15}
                    onChange={e => setPackageModal({ ...packageModal, data: { ...packageModal.data, max_group_size: parseInt(e.target.value) } })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={packageModal.data.image_url || ''}
                  onChange={e => setPackageModal({ ...packageModal, data: { ...packageModal.data, image_url: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Package Description & Itinerary</label>
                <textarea
                  rows={3}
                  value={packageModal.data.description || ''}
                  onChange={e => setPackageModal({ ...packageModal, data: { ...packageModal.data, description: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPackageModal({ open: false, isEditing: false, data: {} })}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                >
                  {packageModal.isEditing ? 'Save Changes' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
