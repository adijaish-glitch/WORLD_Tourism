import { useState, useEffect } from 'react';
import { bookingsAPI } from '../api/client';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id);
      success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      error(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed': return <span className="badge badge-confirmed">Confirmed</span>;
      case 'pending': return <span className="badge badge-pending">Pending</span>;
      case 'cancelled': return <span className="badge badge-cancelled">Cancelled</span>;
      default: return <span className="badge badge-standard">{status}</span>;
    }
  };

  return (
    <div className="container page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>My Dashboard</h1>
          <p>Welcome back, {user?.full_name || 'Traveler'}</p>
        </div>
        <Link to="/packages" className="btn btn-primary">Book New Trip</Link>
      </div>

      {!user?.email_verified && (
        <div className="auth-inline-alert info" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✉️</span>
            <span>Your email <strong>{user?.email}</strong> is not yet verified.</span>
          </div>
          <Link to={`/verify-email?email=${encodeURIComponent(user?.email || '')}`} style={{ fontWeight: 'bold', color: '#1e40af', textDecoration: 'underline' }}>
            Verify Now →
          </Link>
        </div>
      )}

      <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 'var(--space-lg)' }}>My Bookings</h2>
        
        {loading ? (
          <p className="text-muted">Loading bookings...</p>
        ) : (bookings || []).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✈️</div>
            <h3>No trips booked yet</h3>
            <p>Ready for your next adventure?</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Destination & Package</th>
                  <th>Dates</th>
                  <th>Travelers</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>#{b.id.toString().padStart(5, '0')}</td>
                    <td>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{b.dest_name}</div>
                      <div style={{ fontSize: '0.8rem' }}>{b.package_name}</div>
                    </td>
                    <td>
                      <div>{b.check_in}</div>
                      <div style={{ fontSize: '0.8rem' }}>to {b.check_out}</div>
                    </td>
                    <td>{b.travelers}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>${b.total_price.toLocaleString()}</td>
                    <td>{getStatusBadge(b.status)}</td>
                    <td>
                      {b.status === 'confirmed' && (
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleCancel(b.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
