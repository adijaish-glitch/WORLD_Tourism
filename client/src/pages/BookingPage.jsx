import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packagesAPI, bookingsAPI } from '../api/client';
import { useToast } from '../components/ui/ToastContext';
import { useAuth } from '../features/auth/AuthContext';

export default function BookingPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();

  const [pkg, setPkg] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState(null);

  const [booking, setBooking] = useState({
    check_in: '',
    check_out: '',
    travelers: 1,
    addon_ids: [],
    notes: '',
    payment_method: 'credit_card'
  });

  useEffect(() => {
    packagesAPI.getById(packageId).then(res => {
      setPkg(res.data.package);
      setLoading(false);
    }).catch(() => {
      error('Package not found');
      navigate('/packages');
    });
  }, [packageId, navigate, error]);

  const fetchPricing = async () => {
    try {
      const res = await bookingsAPI.preview({
        packageId,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        travelers: booking.travelers,
        addonIds: booking.addon_ids
      });
      setPricing(res.data.pricing);
    } catch (err) {
      error(err.response?.data?.error || 'Failed to calculate pricing');
    }
  };

  useEffect(() => {
    if (booking.check_in && booking.check_out) {
      fetchPricing();
    }
  }, [booking.check_in, booking.check_out, booking.travelers, booking.addon_ids]);

  const handleNext = () => {
    if (step === 1 && (!booking.check_in || !booking.check_out)) {
      return error('Please select dates');
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      const res = await bookingsAPI.create({ package_id: packageId, ...booking });
      success('Booking confirmed successfully!');
      const newBookingId = res.data?.booking?.id;
      if (newBookingId) {
        navigate(`/booking/confirmation?id=${newBookingId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      error(err.response?.data?.error || 'Booking failed');
    }
  };

  const toggleAddon = (id) => {
    setBooking(prev => ({
      ...prev,
      addon_ids: prev.addon_ids.includes(id) 
        ? prev.addon_ids.filter(a => a !== id)
        : [...prev.addon_ids, id]
    }));
  };

  if (loading) return <div className="container page"><div className="splash-bar mx-auto mt-xl"><div className="splash-bar-inner"></div></div></div>;

  return (
    <div className="container page" style={{ maxWidth: '800px' }}>
      <div className="page-header text-center" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <h1>Complete Your Booking</h1>
        <p>You're booking: <strong style={{ color: 'var(--text-primary)' }}>{pkg.name}</strong></p>
      </div>

      <div className="progress-bar">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="progress-step-circle">1</div> Trip Details
        </div>
        <div className={`progress-line ${step > 1 ? 'completed' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="progress-step-circle">2</div> Add-ons
        </div>
        <div className={`progress-line ${step > 2 ? 'completed' : ''}`}></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="progress-step-circle">3</div> Payment
        </div>
      </div>

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-body">
          
          {step === 1 && (
            <div className="animation-fade">
              <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-xl)' }}>Select Dates & Travelers</h2>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="label">Check In</label>
                  <input type="date" className="input" value={booking.check_in} onChange={e => setBooking({...booking, check_in: e.target.value})} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="label">Check Out</label>
                  <input type="date" className="input" value={booking.check_out} onChange={e => setBooking({...booking, check_out: e.target.value})} min={booking.check_in || new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="form-group" style={{ maxWidth: '200px' }}>
                <label className="label">Number of Travelers</label>
                <input type="number" className="input" value={booking.travelers} onChange={e => setBooking({...booking, travelers: parseInt(e.target.value)})} min="1" max={pkg.max_group_size} />
                <div className="error-text" style={{ color: 'var(--text-muted)' }}>Max group size: {pkg.max_group_size}</div>
              </div>
              <div className="form-group mt-xl">
                <label className="label">Special Requests (Optional)</label>
                <textarea className="textarea" rows="3" value={booking.notes} onChange={e => setBooking({...booking, notes: e.target.value})} placeholder="Dietary requirements, accessibility needs..."></textarea>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animation-fade">
              <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-xl)' }}>Enhance Your Experience</h2>
              {pkg.addons.length === 0 ? <p className="text-muted">No add-ons available for this package.</p> : (
                <div className="grid gap-md">
                  {pkg.addons.map(addon => (
                    <div 
                      key={addon.id} 
                      onClick={() => toggleAddon(addon.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 'var(--space-md)', 
                        padding: 'var(--space-md) var(--space-lg)', 
                        background: booking.addon_ids.includes(addon.id) ? 'rgba(0, 180, 216, 0.06)' : 'var(--bg-input)',
                        border: `1px solid ${booking.addon_ids.includes(addon.id) ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 200ms',
                      }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{addon.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{addon.description}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>+${addon.price} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/person</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && pricing && (
            <div className="animation-fade">
              <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-xl)' }}>Review & Payment</h2>
              
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)' }}>Trip Summary</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                  <div><strong>Dest:</strong> {pkg.dest_name}</div>
                  <div><strong>Hotel:</strong> {pkg.hotel_name} ({pkg.hotel_category})</div>
                  <div><strong>Dates:</strong> {booking.check_in} to {booking.check_out} ({pricing.nights} nights)</div>
                  <div><strong>Travelers:</strong> {pricing.travelers}</div>
                </div>

                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>Price Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  {pricing.breakdown.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: i === pricing.breakdown.length - 2 ? '8px' : 0, borderBottom: i === pricing.breakdown.length - 2 ? '1px solid var(--border-color)' : 'none', fontWeight: i === pricing.breakdown.length - 1 ? 700 : 400, color: i === pricing.breakdown.length - 1 ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: i === pricing.breakdown.length - 1 ? '1.2rem' : '0.9rem' }}>
                      <span>{item.label}</span>
                      <span>{item.value < 0 ? '-' : ''}${Math.abs(item.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Payment Method</label>
                <select className="select" value={booking.payment_method} onChange={e => setBooking({...booking, payment_method: e.target.value})}>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          )}

        </div>
        <div style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-color)', padding: 'var(--space-lg) var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {pricing && <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total: ${pricing.totalPrice.toLocaleString()}</div>}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 3 ? (
              <button className="btn btn-primary" onClick={handleNext}>Continue</button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit}>Confirm Booking</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
