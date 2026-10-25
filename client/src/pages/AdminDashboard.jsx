import { useState, useEffect } from 'react';
import { reportsAPI, bookingsAPI, usersAPI } from '../api/client';
import { useAuth } from '../features/auth/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from '../components/ui/ToastContext';

const CHART_COLORS = ['#083c6b', '#00b4d8', '#2a9df4', '#85c1e9', '#0d9f6e', '#d97706', '#dc2626', '#dce7f5'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, revRes, occRes, bookRes, userRes] = await Promise.all([
        reportsAPI.summary(),
        reportsAPI.revenue(),
        reportsAPI.occupancy(),
        bookingsAPI.list({ limit: 20 }),
        usersAPI.list()
      ]);
      setStats(stRes.data.stats);
      setRevenue(revRes.data.data);
      setOccupancy(occRes.data.data.slice(0, 10)); // Top 10
      setBookings(bookRes.data.bookings);
      setUsers(userRes.data.users);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id);
      success('Booking cancelled');
      fetchData();
    } catch (err) { error('Failed to cancel'); }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await usersAPI.update(id, { is_active: !currentStatus });
      success('User updated');
      fetchData();
    } catch (err) { error('Update failed'); }
  };

  if (loading || !stats) return <div className="container page"><div className="splash-bar mx-auto mt-xl"><div className="splash-bar-inner"></div></div></div>;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Admin Control Panel</h1>
        <p>System overview and management.</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border-color)' }}>
        {['overview', 'bookings', 'users'].map(tab => (
          <button 
            key={tab} 
            className="btn btn-ghost"
            style={{ 
              borderRadius: 0, 
              borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="animation-fade">
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-2xl)' }}>
            {[
              { icon: '💰', label: 'Total Revenue', value: '$' + stats.total_revenue.toLocaleString() },
              { icon: '✈️', label: 'Active Bookings', value: stats.active_bookings },
              { icon: '🌐', label: 'Countries Catalogued', value: stats.total_countries || 250 },
              { icon: '🌍', label: 'Destinations', value: stats.total_destinations },
              { icon: '👥', label: 'Total Users', value: stats.total_users }
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {s.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-2">
            <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--space-lg)' }}>Revenue Trend</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#00b4d8" strokeWidth={2} dot={{ fill: '#00b4d8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--space-lg)' }}>Hotel Occupancy Rate</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancy} margin={{ bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="hotel_name" stroke="var(--text-muted)" fontSize={11} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                    <Bar dataKey="occupancy_rate" fill="#2a9df4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="animation-fade glass-card" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--space-lg)' }}>Recent Bookings</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>
                      <div>{b.customer_name}</div>
                      <div style={{ fontSize: '0.75rem' }}>{b.customer_email}</div>
                    </td>
                    <td>{b.dest_name}</td>
                    <td>{b.check_in}</td>
                    <td style={{ fontWeight: 600 }}>${b.total_price.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${b.status === 'confirmed' ? 'confirmed' : b.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'confirmed' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="animation-fade glass-card" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--space-lg)' }}>User Management</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Passenger</th>
                  <th>Email</th>
                  <th>Verification</th>
                  <th>Provider</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ marginRight: '6px' }}>{u.avatar_url || '👤'}</span>
                      {u.full_name}
                      {u.username && <span style={{ fontSize: '0.8rem', color: '#71717a', display: 'block' }}>@{u.username}</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.email_verified ? 'badge-confirmed' : 'badge-pending'}`}>
                        {u.email_verified ? '✓ Verified' : '○ Unverified'}
                      </span>
                    </td>
                    <td><span className="badge badge-standard" style={{ textTransform: 'capitalize' }}>{u.provider || 'local'}</span></td>
                    <td><span className="badge badge-standard">{u.role}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${u.is_active ? 'confirmed' : 'cancelled'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {u.id !== user.id && (
                        <button 
                          className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`} 
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
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
    </div>
  );
}
