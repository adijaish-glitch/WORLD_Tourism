import { useState } from 'react';
import { travelAPI } from '../../api/client';
import {
  IconFlight,
  IconTrain,
  IconBus,
  IconGlobe,
  IconShieldTrust,
  IconQuickAction,
  IconClose
} from '../ui/Icons';

export default function ExternalBookingModal({ offer, onClose }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!offer) return null;

  const handleProceed = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await travelAPI.redirect({
        targetUrl: offer.deep_link || offer.deepLink || 'https://www.makemytrip.com',
        providerCode: offer.providerCode || offer.provider_code || 'MAKEMYTRIP',
        category: offer.category || 'travel'
      });

      if (res.data?.destinationUrl) {
        window.open(res.data.destinationUrl, '_blank', 'noopener,noreferrer');
        onClose();
      } else {
        setErrorMsg('Unable to verify outbound provider link.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to initialize safe redirect to partner.');
    } finally {
      setLoading(false);
    }
  };

  const getProviderBrand = () => {
    const code = (offer.providerCode || offer.provider_code || '').toUpperCase();
    if (code.includes('MAKEMYTRIP')) return { name: 'MakeMyTrip', badgeColor: '#e11b22', Icon: IconQuickAction };
    if (code.includes('IRCTC')) return { name: 'IRCTC Official', badgeColor: '#1d4ed8', Icon: IconTrain };
    if (code.includes('REDBUS')) return { name: 'RedBus Verified', badgeColor: '#dc2626', Icon: IconBus };
    if (code.includes('AMADEUS')) return { name: 'Amadeus Airline Hub', badgeColor: '#0284c7', Icon: IconFlight };
    return { name: 'Authorized Travel Partner', badgeColor: '#4f46e5', Icon: IconGlobe };
  };

  const brand = getProviderBrand();
  const BrandIcon = brand.Icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '520px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrandIcon size={24} />
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: '#f1f5f9',
              color: '#334155',
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px'
            }}>
              Official Partner Redirect
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f4f4f5',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#71717a'
            }}
          >
            <IconClose size={12} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-sans)', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
          You're heading to {brand.name}
        </h3>
        <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
          TIMS partners with accredited global inventory networks to bring you verified real-time availability and transparent pricing.
        </p>

        {/* Selected Offer Box */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
            {offer.title}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>{offer.operator_or_airline || offer.stops_or_class || 'Partner Offer'}</span>
            <span style={{ fontWeight: 700, color: '#16a34a' }}>${offer.price} {offer.price_basis ? `(${offer.price_basis.replace('_', ' ')})` : ''}</span>
          </div>
        </div>

        {/* Security & Consumer Notice */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          padding: '0.85rem',
          fontSize: '0.82rem',
          color: '#1e40af',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <IconShieldTrust size={20} />
          <div>
            <strong>Consumer Protection Notice:</strong> Your payment and ticket confirmation will take place directly on {brand.name}'s encrypted portal. TIMS never stores your payment card credentials.
          </div>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '10px',
            padding: '0.75rem',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn"
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Stay on TIMS
          </button>
          <button
            onClick={handleProceed}
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Validating Link...' : `Continue to ${brand.name} ↗`}
          </button>
        </div>
      </div>
    </div>
  );
}

