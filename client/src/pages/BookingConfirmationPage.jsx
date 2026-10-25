import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../api/client';

export default function BookingConfirmationPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      bookingsAPI.getById(bookingId)
        .then(res => {
          setBooking(res.data.booking || null);
          setLoading(false);
        })
        .catch(() => {
          // Fallback to list search if direct getById has permission issue or legacy format
          bookingsAPI.list().then(res => {
            const found = res.data.bookings.find(b => b.id === Number(bookingId));
            setBooking(found || null);
            setLoading(false);
          }).catch(() => setLoading(false));
        });
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="container page">
        <div className="splash-bar mx-auto mt-xl"><div className="splash-bar-inner"></div></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container page" style={{ textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Booking not found</h3>
          <p>We couldn't find this booking. It may have been removed.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page" style={{ maxWidth: '600px' }}>
      {/* Success Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: '#f0fdf4', border: '2px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', fontSize: '2.5rem',
        }}>
          ✓
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#09090b', marginBottom: '0.5rem' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: '#71717a', fontSize: '1.1rem' }}>
          Your trip has been booked successfully. Here are the details.
        </p>
      </div>

      {/* Booking Receipt */}
      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-body" style={{ padding: '2rem' }}>
          {/* Confirmation Number */}
          <div style={{
            background: '#f4f4f5', borderRadius: '12px', padding: '1.25rem',
            textAlign: 'center', marginBottom: '2rem',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Confirmation Number
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              {booking.reference_number || `TIMS-${String(booking.id).padStart(5, '0')}`}
            </div>
          </div>

          {/* Trip Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <DetailRow label="Destination" value={booking.dest_name} />
            <DetailRow label="Package" value={booking.package_name} />
            <DetailRow label="Check In" value={formatDate(booking.check_in)} />
            <DetailRow label="Check Out" value={formatDate(booking.check_out)} />
            <DetailRow label="Travelers" value={booking.travelers} />
            <DetailRow label="Payment Method" value={formatPayment(booking.payment_method)} />
            {booking.notes && <DetailRow label="Special Requests" value={booking.notes} />}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '2px dashed #e4e4e7', margin: '1.5rem 0' }} />

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#09090b' }}>Total Paid</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-sans)' }}>
              ${booking.total_price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
        <Link to="/dashboard" className="btn btn-primary">View My Bookings</Link>
        <Link to="/packages" className="btn" style={{ background: '#f4f4f5', color: '#09090b', border: '1px solid #e4e4e7' }}>
          Book Another Trip
        </Link>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ color: '#71717a', fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
      <span style={{ color: '#09090b', fontWeight: 600, fontSize: '0.95rem', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatPayment(method) {
  const map = { credit_card: 'Credit Card', paypal: 'PayPal', bank_transfer: 'Bank Transfer' };
  return map[method] || method;
}
