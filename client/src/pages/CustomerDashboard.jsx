import { useState, useEffect } from 'react';
import { bookingsAPI, travelAPI } from '../api/client';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import { Link } from 'react-router-dom';
import {
  IconFlight,
  IconHotel,
  IconTrain,
  IconGlobe,
  IconEmail,
  NavSupport,
  IconWarning
} from '../components/ui/Icons';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('direct'); // 'direct', 'external', 'inquiries'

  const fetchBookings = () => {
    setLoading(true);
    bookingsAPI.list().then(res => {
      setBookings(Array.isArray(res.data?.bookings) ? res.data.bookings : []);
      setLoading(false);
    }).catch(() => {
      setBookings([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will release reserved room and itinerary slots.')) return;
    try {
      await bookingsAPI.cancel(id);
      success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      error(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <span className="badge badge-confirmed">Confirmed</span>;
      case 'pending': return <span className="badge badge-pending">Pending Revalidation</span>;
      case 'cancelled': return <span className="badge badge-cancelled">Cancelled</span>;
      default: return <span className="badge badge-standard">{status}</span>;
    }
  };

  const directBookings = bookings.filter(b => (b.booking_type || 'package') !== 'external');
  const externalBookings = bookings.filter(b => b.booking_type === 'external');

  return (
    <div className="container page">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge-pill" style={{ marginBottom: '0.5rem', background: '#e0f2fe', color: '#0369a1' }}>
            Traveler Hub & Itineraries
          </div>
          <h1>My Travel Dashboard</h1>
          <p>Welcome back, {user?.full_name || 'Traveler'} · Manage your vacations, transport, and bookings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/search" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <IconFlight size={16} />
            <span>Book New Trip</span>
          </Link>
          <Link to="/profile" className="btn" style={{ background: '#f4f4f5', border: '1px solid #e4e4e7' }}>Edit Profile</Link>
        </div>
      </div>

      {!user?.email_verified && (
        <div className="auth-inline-alert info" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconEmail size={16} />
            <span>Your email <strong>{user?.email}</strong> is not yet verified.</span>
          </div>
          <Link to={`/verify-email?email=${encodeURIComponent(user?.email || '')}`} style={{ fontWeight: 'bold', color: '#1e40af', textDecoration: 'underline' }}>
            Verify Now →
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '2px solid #f1f5f9',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('direct')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0.5rem',
            borderBottom: activeTab === 'direct' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'direct' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'direct' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconHotel size={18} />
          <span>Confirmed Direct Bookings ({directBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('external')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0.5rem',
            borderBottom: activeTab === 'external' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'external' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'external' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconGlobe size={18} />
          <span>External Partner Bookings ({externalBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0.5rem',
            borderBottom: activeTab === 'inquiries' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'inquiries' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'inquiries' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <NavSupport size={18} />
          <span>Support & Custom Inquiries</span>
        </button>
      </div>

      {/* Tab 1: Confirmed Direct Bookings */}
      {activeTab === 'direct' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: 0 }}>TIMS Direct Bookings</h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Guaranteed reservations handled by TIMS hospitality partners</span>
          </div>
          
          {loading ? (
            <p className="text-muted">Loading reservations...</p>
          ) : directBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <IconFlight size={48} />
              </div>
              <h3>No direct trips booked yet</h3>
              <p>Explore thousands of destinations, curated vacation packages, and luxury stays.</p>
              <Link to="/packages" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Packages</Link>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Destination & Package</th>
                    <th>Travel Dates</th>
                    <th>Travelers</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {directBookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {b.reference_number || `TIMS-${String(b.id).padStart(5, '0')}`}
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{b.dest_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.package_name || 'Standard Package'}</div>
                      </td>
                      <td>
                        <div>{b.check_in}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>to {b.check_out}</div>
                      </td>
                      <td>{b.travelers} Traveler{b.travelers > 1 ? 's' : ''}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                        ${Number(b.total_price || 0).toLocaleString()}
                      </td>
                      <td>{getStatusBadge(b.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <Link to={`/booking-confirmation?id=${b.id}`} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                            Receipt
                          </Link>
                          {b.status === 'confirmed' && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)', padding: '4px 8px', fontSize: '0.8rem' }}
                              onClick={() => handleCancel(b.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: External Partner Bookings */}
      {activeTab === 'external' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <IconWarning size={24} />
            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
              <strong>External Provider Management:</strong> Flights, trains, and partner accommodations booked via MakeMyTrip, IRCTC, or RedBus are confirmed on the partner's platform. For modifications, cancellations, or ticket downloads, please log in directly to the respective provider's portal using your PNR or booking email.
            </div>
          </div>

          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <IconGlobe size={48} />
            </div>
            <h3>Looking for external reservations?</h3>
            <p>You can search live partner airfare and railway timetables on our search hub anytime.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Link to="/search?category=flights" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconFlight size={16} />
                <span>Search Flights</span>
              </Link>
              <Link to="/search?category=trains" className="btn" style={{ background: '#f4f4f5', border: '1px solid #e4e4e7', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconTrain size={16} />
                <span>Train Timetables</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Custom Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1rem' }}>Support & Custom Travel Planning</h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            Need a bespoke itinerary, group charter, or corporate booking? Our destination specialists are here to assist.
          </p>

          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '1.05rem', marginBottom: '4px' }}>
                TIMS Concierge Travel Desk Active
              </div>
              <div style={{ fontSize: '0.85rem', color: '#15803d' }}>
                Email inquiries are responded to within 4 business hours.
              </div>
            </div>
            <a href="mailto:support@tims-tourism.com" className="btn btn-primary" style={{ borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconEmail size={16} />
              <span>Contact Concierge</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
