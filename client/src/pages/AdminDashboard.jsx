import { useState, useEffect } from 'react';
import { reportsAPI, bookingsAPI, usersAPI, travelAPI, accountAPI } from '../api/client';
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
  const [providers, setProviders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, revRes, occRes, bookRes, userRes, provRes, auditRes, tktRes] = await Promise.all([
        reportsAPI.summary(),
        reportsAPI.revenue(),
        reportsAPI.occupancy(),
        bookingsAPI.list({ limit: 20 }),
        usersAPI.list(),
        travelAPI.providers().catch(() => ({ data: { providers: [] } })),
        travelAPI.auditLogs({ limit: 30 }).catch(() => ({ data: { logs: [] } })),
        accountAPI.adminListTickets().catch(() => ({ data: { tickets: [] } }))
      ]);
      setStats(stRes.data.stats);
      setRevenue(revRes.data.data);
      setOccupancy(occRes.data.data.slice(0, 10)); // Top 10
      setBookings(bookRes.data.bookings);
      setUsers(userRes.data.users);
      setProviders(provRes.data.providers || []);
      setAuditLogs(auditRes.data.logs || []);
      setTickets(tktRes.data.tickets || []);
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge-pill" style={{ marginBottom: '0.5rem', background: '#fef3c7', color: '#92400e' }}>
            🛡️ Administrative Authority
          </div>
          <h1>TIMS Executive Control Console</h1>
          <p>System overview, multi-provider travel integrations, booking oversight, and audit logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchData} className="btn" style={{ background: '#f4f4f5', border: '1px solid #e4e4e7', fontSize: '0.88rem' }}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview & Metrics' },
          { id: 'bookings', label: 'Direct Bookings' },
          { id: 'tickets', label: `Support Tickets (${tickets.filter(t => t.status !== 'closed').length})` },
          { id: 'providers', label: 'Travel Integrations' },
          { id: 'audit', label: 'Security Audit Logs' },
          { id: 'users', label: 'User Directory' }
        ].map(tab => (
          <button
            key={tab.id}
            className="btn btn-ghost"
            style={{
              borderRadius: 0,
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              whiteSpace: 'nowrap'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="animation-fade">
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-2xl)' }}>
            {[
              { icon: '💰', label: 'Total Revenue', value: '$' + stats.total_revenue.toLocaleString() },
              { icon: '✈️', label: 'Active Bookings', value: stats.active_bookings },
              { icon: '🌐', label: 'Countries Catalogued', value: stats.total_countries || 250 },
              { icon: '🌍', label: 'Destinations', value: stats.total_destinations },
              { icon: '👥', label: 'Total Users', value: stats.total_users },
              { icon: '🏢', label: 'Integrated Providers', value: providers.length || 6 }
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

      {/* TAB 2: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="animation-fade glass-card" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--space-lg)' }}>Recent Bookings</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ref ID</th>
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
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {b.reference_number || `TIMS-${String(b.id).padStart(5, '0')}`}
                    </td>
                    <td>
                      <div>{b.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{b.customer_email}</div>
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

      {/* TAB 3: TRAVEL INTEGRATIONS & PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="animation-fade glass-card" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 4px 0' }}>Multi-Provider Inventory Architecture</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                Authorized distribution connectors, ticketing partners, and meta-search links.
              </p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Provider Code</th>
                  <th>Partner Name</th>
                  <th>Category</th>
                  <th>Website Portal</th>
                  <th>Fulfillment Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#1e40af' }}>{p.provider_code}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span className="badge badge-standard" style={{ textTransform: 'capitalize' }}>
                        {p.category}
                      </span>
                    </td>
                    <td>
                      <a href={p.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.85rem' }}>
                        {p.website_url.replace('https://', '')} ↗
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${p.supports_direct_booking ? 'badge-confirmed' : 'badge-pending'}`}>
                        {p.supports_direct_booking ? '⚡ Direct API Booking' : '↗ Safe Outbound Redirect'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-confirmed">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="animation-fade glass-card" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 4px 0' }}>Security & Transaction Audit Logs</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                Immutable event stream for open-redirect tracking, customer referrals, and administrative mutations.
              </p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User ID</th>
                  <th>IP Address</th>
                  <th>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No recent audit events logged.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: l.action.includes('REDIRECT') ? '#e0f2fe' : '#f1f5f9',
                          color: l.action.includes('REDIRECT') ? '#0369a1' : '#334155'
                        }}>
                          {l.action}
                        </span>
                      </td>
                      <td>{l.user_id ? `#${l.user_id}` : 'Anonymous Traveler'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{l.ip_address}</td>
                      <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SUPPORT CONCIERGE TICKETS */}
      {activeTab === 'tickets' && (
        <div className="animation-fade">
          <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1.2fr' : '1fr', gap: '1.5rem' }}>
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Customer Support Requests</h3>
                  <span className="badge badge-standard">{tickets.length} Total</span>
                </div>

                {tickets.length === 0 ? (
                  <p style={{ color: '#71717a' }}>No support requests logged.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tickets.map(t => (
                      <div
                        key={t.id}
                        onClick={async () => {
                          try {
                            const res = await accountAPI.adminGetTicket(t.id);
                            setSelectedTicket(res.data);
                          } catch (err) {
                            error('Failed to load ticket details');
                          }
                        }}
                        style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: selectedTicket?.ticket?.id === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: selectedTicket?.ticket?.id === t.id ? '#eff6ff' : '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>#{t.ticket_number}</strong>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: t.status === 'open' ? '#dbeafe' : t.status === 'resolved' ? '#dcfce7' : t.status === 'closed' ? '#f1f5f9' : '#fef3c7',
                            color: t.status === 'open' ? '#1d4ed8' : t.status === 'resolved' ? '#15803d' : t.status === 'closed' ? '#64748b' : '#b45309'
                          }}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700 }}>{t.subject}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                          Traveler: {t.user_name} ({t.user_email}) ∙ {t.booking_reference ? `Ref #${t.booking_reference}` : 'General'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedTicket && (
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                        #{selectedTicket.ticket.ticket_number} ∙ Category: {selectedTicket.ticket.category}
                      </span>
                      <h3 style={{ margin: '0.25rem 0', fontSize: '1.2rem', fontWeight: 800 }}>{selectedTicket.ticket.subject}</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                        From: {selectedTicket.ticket.user_name} ({selectedTicket.ticket.user_email}) ∙ {selectedTicket.ticket.booking_reference && `Booking Ref: ${selectedTicket.ticket.booking_reference}`}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={selectedTicket.ticket.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await accountAPI.adminUpdateTicketStatus(selectedTicket.ticket.id, newStatus);
                            success(`Status updated to ${newStatus}`);
                            setSelectedTicket(prev => ({ ...prev, ticket: { ...prev.ticket, status: newStatus } }));
                            fetchData();
                          } catch (err) {
                            error('Failed to update status');
                          }
                        }}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="awaiting_user_response">Awaiting User Response</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Thread messages */}
                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem' }}>
                    {selectedTicket.messages?.map(m => {
                      const isSupport = m.sender_type === 'support';
                      return (
                        <div
                          key={m.id}
                          style={{
                            alignSelf: isSupport ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            background: isSupport ? '#eff6ff' : '#f8fafc',
                            border: '1px solid',
                            borderColor: isSupport ? '#bfdbfe' : '#e2e8f0',
                            padding: '0.85rem',
                            borderRadius: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.2rem' }}>
                            <strong style={{ fontSize: '0.8rem', color: isSupport ? '#1d4ed8' : '#0f172a' }}>
                              {m.sender_name} {isSupport && '🛡️'}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
                            {m.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Form */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!adminReplyText.trim()) return;
                      try {
                        const res = await accountAPI.adminReplyTicket(selectedTicket.ticket.id, {
                          message: adminReplyText,
                          status: 'awaiting_user_response'
                        });
                        setSelectedTicket(res.data);
                        setAdminReplyText('');
                        success('Reply dispatched to customer');
                        fetchData();
                      } catch (err) {
                        error('Failed to send reply');
                      }
                    }}
                    style={{ display: 'flex', gap: '0.75rem' }}
                  >
                    <input
                      type="text"
                      className="input"
                      placeholder="Write concierge reply to traveler..."
                      value={adminReplyText}
                      onChange={e => setAdminReplyText(e.target.value)}
                      style={{ flex: 1, margin: 0 }}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontWeight: 700, borderRadius: '10px' }}>
                      Send Reply
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: USERS */}
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
