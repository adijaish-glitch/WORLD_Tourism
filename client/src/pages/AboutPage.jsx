import { Link } from 'react-router-dom';
import {
  IconAdminOffice,
  IconHolidayPackage,
  IconQuickAction,
  NavSupport,
  IconGlobe,
  AvatarTropical,
  IconShieldTrust
} from '../components/ui/Icons';

export default function AboutPage() {
  const team = [
    { name: 'Operations', Icon: IconAdminOffice, desc: 'Managing logistics and partnerships with hotels and airlines worldwide.' },
    { name: 'Curation', Icon: IconHolidayPackage, desc: 'Hand-picking destinations and designing unforgettable itineraries.' },
    { name: 'Technology', Icon: IconQuickAction, desc: 'Building seamless booking experiences with cutting-edge tools.' },
    { name: 'Support', Icon: NavSupport, desc: 'Available 24/7 to ensure every journey goes smoothly.' },
  ];

  const stats = [
    { value: '250', label: 'Countries Catalogued' },
    { value: '50+', label: 'Destinations' },
    { value: '200+', label: 'Hotel Partners' },
    { value: '10K+', label: 'Happy Travelers' },
  ];

  return (
    <div className="page">
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <div className="badge-pill" style={{ marginBottom: '1.5rem' }}>Est. 2024</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', color: '#09090b' }}>
            About <span className="italic">TIMS</span>
          </h1>
          <p style={{ color: '#71717a', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.8 }}>
            TIMS — Travel & Itinerary Management System — was born from a simple idea: 
            travel should be effortless, beautiful, and deeply personal. We combine technology 
            with human curation to craft journeys that stay with you forever.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 2rem' }}>
        {/* Stats */}
        <div className="grid grid-4" style={{ marginBottom: '5rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-sans)', marginBottom: '0.5rem' }}>
                {s.value}
              </div>
              <div style={{ color: '#71717a', fontSize: '0.95rem', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div style={{ maxWidth: '800px', margin: '0 auto 5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', marginBottom: '1.5rem', color: '#09090b' }}>
            Our <span className="italic">Mission</span>
          </h2>
          <p style={{ color: '#52525b', fontSize: '1.1rem', lineHeight: 1.8 }}>
            We believe that every journey should tell a story. Our mission is to democratize 
            premium travel experiences — making world-class destinations, boutique hotels, and 
            curated itineraries accessible to every traveler, not just the privileged few.
          </p>
        </div>

        {/* Team Departments */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', marginBottom: '2rem', textAlign: 'center', color: '#09090b' }}>
          Our <span className="italic">Team</span>
        </h2>
        <div className="grid grid-4" style={{ marginBottom: '5rem' }}>
          {team.map((t, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><t.Icon size={40} /></div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem', color: '#09090b' }}>
                {t.name}
              </h3>
              <p style={{ color: '#71717a', fontSize: '0.9rem', lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{ background: '#fafafa', borderRadius: '24px', padding: '3rem', border: '1px solid #e4e4e7', marginBottom: '4rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#09090b' }}>
            What We <span className="italic">Value</span>
          </h2>
          <div className="grid grid-3">
            {[
              { title: 'Authenticity', desc: 'We showcase destinations as they truly are — no filters, no false promises.', Icon: IconGlobe },
              { title: 'Sustainability', desc: 'We partner with eco-conscious hotels and promote responsible tourism.', Icon: AvatarTropical },
              { title: 'Accessibility', desc: 'Premium travel experiences should be available to everyone, everywhere.', Icon: IconShieldTrust },
            ].map((v, i) => (
              <div key={i} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}><v.Icon size={28} /></div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: '#09090b' }}>
                  {v.title}
                </h3>
                <p style={{ color: '#71717a', fontSize: '0.9rem', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem', color: '#09090b' }}>
            Ready to explore?
          </h2>
          <p style={{ color: '#71717a', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Start planning your next adventure today.
          </p>
          <Link to="/packages" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            View Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
