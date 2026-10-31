import { IconShieldTrust, NavSecurity, IconSearch, IconEmail, IconClose, IconGlobe, IconCalendar } from '../components/ui/Icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('collection');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const sections = [
    {
      id: 'collection',
      number: '01',
      title: 'Information We Collect',
      content: `TIMS collects only the minimal personal data essential to fulfill travel bookings and deliver a personalized experience:
• Profile & Authentication Data: Full name, verified email address, phone number (for SMS OTP delivery), username, and salted password hashes.
• Reservation Records: Destination selections, hotel booking dates, passenger counts, room category preferences, and itinerary archives.
• Technical & Session Metadata: IP address, user-agent details, and encrypted session identifiers generated during authentication.
We never collect, store, or log sensitive government identifiers or unencrypted payment card details.`
    },
    {
      id: 'usage',
      number: '02',
      title: 'How We Utilize Your Information',
      content: `Your data is processed strictly for legitimate operational purposes:
• Booking Execution: Communicating guest credentials with boutique hotels, airlines, and licensed local tour operators.
• Account Security: Generating cryptographically random 6-digit SMS OTPs, dispatching email verification links, and monitoring against brute-force attacks.
• Platform Personalization: Curating tailored destination recommendations and regional travel advisories based on your search history.
• Customer Concierge: Assisting with itinerary modifications, cancellations, and real-time travel support.`
    },
    {
      id: 'sharing',
      number: '03',
      title: 'Third-Party Sharing & Data Escrow',
      content: `TIMS operates under a strict Zero Data Broker policy: WE NEVER SELL, RENT, OR MONETIZE YOUR PERSONAL INFORMATION.
We share selective details solely with:
• Direct Travel Service Providers: Hotels and tour operators chosen by you to fulfill your itinerary.
• Certified Payment Processors: PCI-DSS Level 1 compliant processors for immediate charge authorization.
• Telecommunication Gateways: Twilio and authorized SMS carriers solely for the instant transmission of verification OTP codes.
• Law Enforcement & Statutory Authorities: Only when legally mandated by a valid court order or subpoena.`
    },
    {
      id: 'security',
      number: '04',
      title: 'Cryptographic Security & Architecture',
      content: `We deploy multi-layered defense mechanisms to safeguard your data assets:
• Passwords: Protected via Bcrypt adaptive hashing (10 computation rounds), preventing rainbow table exploits.
• Data in Transit: Enforced TLS 1.3 encryption across all client-server communications with strict HSTS headers.
• Data at Rest: Sensitive database records encrypted with industry-standard AES-256 ciphers.
• Session Revocation: Real-time session revocation on server memory and database upon logout, preventing token replay.`
    },
    {
      id: 'cookies',
      number: '05',
      title: 'Cookie Architecture & Session Integrity',
      content: `TIMS does not employ intrusive third-party advertising cookies or cross-site tracking pixels.
Our platform uses solely First-Party Essential Cookies:
• Authentication Session Cookie (tims_session): Set with the HttpOnly flag, SameSite='lax', and Secure flags to shield authentication tokens from malicious client-side JavaScript (XSS).
• Interface Preferences: Storing your localized language and regional display preferences in local storage.`
    },
    {
      id: 'rights',
      number: '06',
      title: 'Your Global Privacy Rights (GDPR & CCPA)',
      content: `Regardless of your physical residency, TIMS affords all travelers comprehensive privacy prerogatives:
• Right to Access: Request a machine-readable export of all stored personal profile and reservation data.
• Right to Rectification: Correct inaccurate or outdated details directly via your Traveler Profile.
• Right to Erasure ("Right to be Forgotten"): Request permanent deletion of your user account and linked metadata.
• Right to Restrict Processing: Opt out of non-essential analytical tracking at any point.`
    },
    {
      id: 'retention',
      number: '07',
      title: 'Data Retention & Archival Policies',
      content: `We retain personal data only for as long as necessary to maintain your active account and deliver contracted travel services. Completed booking receipts and transaction ledgers are retained for a statutory period of 5 years to comply with international accounting, auditing, and tax standards. Inactive guest profiles are purged automatically after 24 months of inactivity.`
    },
    {
      id: 'minors',
      number: '08',
      title: 'Protection of Children’s Privacy',
      content: `TIMS is directed toward adult travelers and does not knowingly collect personal data from minors under 16 years of age without explicit guardian verification. If we detect that a child has submitted personal details without parental consent, we take immediate measures to delete the data from our repositories.`
    },
    {
      id: 'transfers',
      number: '09',
      title: 'International Cross-Border Transfers',
      content: `Because travel is fundamentally global, fulfilling your bookings may involve transmitting reservation itineraries to verified hospitality partners located outside your home territory. All cross-border transmissions adhere to Standard Contractual Clauses (SCCs) and rigorous international privacy safeguards.`
    },
    {
      id: 'dpo',
      number: '10',
      title: 'Data Protection Officer & Contact',
      content: `TIMS has designated an independent Data Protection Officer (DPO) to oversee ongoing compliance and assist travelers with privacy queries or data subject requests.
You can reach our privacy governance team at:
Email: privacy@tims-tourism.com
Physical Office: TIMS Global Privacy Directorate, 100 Marina Boulevard, Suite 400
Response SLA: All privacy inquiries are acknowledged within 24 hours and resolved within 14 calendar days.`
    }
  ];

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)', paddingBottom: '6rem' }}>
      
      {/* ─── Hero Header ─── */}
      <section style={{
        background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
        color: '#ffffff',
        padding: '5.5rem 2rem 4.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94, 234, 212, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '1100px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.4rem 1.1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.15)' }}>
            <NavSecurity size={16} /> Privacy & Data Governance • Version 2.4
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            color: '#ffffff'
          }}>
            Privacy <span className="italic" style={{ color: '#5eead4' }}>Policy</span>
          </h1>

          <p style={{
            color: '#a1a1aa',
            fontSize: '1.1rem',
            maxWidth: '680px',
            lineHeight: 1.7,
            marginBottom: '2rem'
          }}>
            Your privacy is foundational to everything we build. Discover how TIMS encrypts your identity, safeguards your travel reservations, and respects your global data rights.
          </p>

          {/* Quick Privacy Guarantees */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2.5rem',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconShieldTrust size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', fontWeight: 600 }}>Zero Selling</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f4f4f5' }}>Never Sold or Monetized</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconShieldTrust size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', fontWeight: 600 }}>No Trackers</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f4f4f5' }}>Zero 3rd-Party Ads</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconShieldTrust size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', fontWeight: 600 }}>Session Safety</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f4f4f5' }}>HttpOnly Secure Cookies</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconShieldTrust size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', fontWeight: 600 }}>Compliance</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f4f4f5' }}>GDPR & CCPA Standard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Controls & Content Grid ─── */}
      <div className="container" style={{ maxWidth: '1150px', marginTop: '2.5rem' }}>
        
        {/* Controls Bar: Search & Actions */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
          border: '1px solid #e4e4e7',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Live Search Filter */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}><IconSearch size={16} /></span>
            <input
              type="text"
              placeholder="Search data collection, cookies, GDPR rights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.6rem',
                borderRadius: '10px',
                border: '1px solid #e4e4e7',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#18181b'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyLink}
              className="btn"
              style={{
                background: '#f4f4f5',
                color: '#18181b',
                padding: '0.6rem 1.1rem',
                fontSize: '0.85rem',
                border: '1px solid #e4e4e7'
              }}
            >
              {copied ? '• Link Copied!' : ' Share Policy'}
            </button>
            
            <button
              onClick={() => window.print()}
              className="btn"
              style={{
                background: '#f4f4f5',
                color: '#18181b',
                padding: '0.6rem 1.1rem',
                fontSize: '0.85rem',
                border: '1px solid #e4e4e7'
              }}
            >
               Print Policy
            </button>

            <Link
              to="/terms"
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
            >
              Terms of Service →
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
          
          {/* Left: Sticky Sidebar */}
          <aside style={{ gridColumn: 'span 4' }}>
            <div style={{
              position: 'sticky',
              top: '100px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e4e4e7',
              padding: '1.5rem',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Privacy Sections</span>
                <span style={{ background: '#f4f4f5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>{sections.length} Topics</span>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '60vh', overflowY: 'auto' }}>
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    style={{
                      textAlign: 'left',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: activeSection === sec.id ? '#09090b' : 'transparent',
                      color: activeSection === sec.id ? '#ffffff' : '#52525b',
                      fontWeight: activeSection === sec.id ? 600 : 500,
                      fontSize: '0.86rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', opacity: activeSection === sec.id ? 0.7 : 0.5, fontFamily: 'monospace' }}>{sec.number}</span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sec.title}</span>
                  </button>
                ))}
              </nav>

              {/* Data Rights Inquiries */}
              <div style={{ marginTop: '1.75rem', padding: '1.1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#09090b', marginBottom: '0.35rem' }}>
                  Exercise Your Data Rights
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  Need a copy of your records or wish to permanently delete your account?
                </p>
                <a
                  href="mailto:privacy@tims-tourism.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#09090b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                   privacy@tims-tourism.com →
                </a>
              </div>
            </div>
          </aside>

          {/* Right: Detailed Sections */}
          <main style={{ gridColumn: 'span 8' }}>
            {filteredSections.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #e4e4e7' }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}><IconSearch size={48} /></div>
                <h3 style={{ fontSize: '1.25rem', color: '#18181b', marginBottom: '0.5rem' }}>No matching clauses found</h3>
                <p style={{ color: '#71717a', fontSize: '0.95rem' }}>Try searching for a different keyword or clear the search field to view the complete policy.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-primary"
                  style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredSections.map((sec) => (
                  <motion.div
                    key={sec.id}
                    id={sec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '2rem',
                      border: '1px solid #e4e4e7',
                      boxShadow: '0 2px 12px -2px rgba(0,0,0,0.03)',
                      scrollMarginTop: '110px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#f4f4f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem'
                        }}>
                          <IconShieldTrust size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#a1a1aa', fontWeight: 600 }}>ARTICLE {sec.number}</div>
                          <h2 style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1.28rem',
                            fontWeight: 700,
                            color: '#09090b',
                            lineHeight: 1.3
                          }}>
                            {sec.title}
                          </h2>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${sec.id}`);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        title="Copy direct section link"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a1a1aa',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          padding: '4px'
                        }}
                      >
                        #
                      </button>
                    </div>

                    <div style={{
                      color: '#52525b',
                      fontSize: '0.98rem',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-line'
                    }}>
                      {sec.content}
                    </div>
                  </motion.div>
                ))}

                {/* Bottom Assurance Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: '1px solid #99f6e4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '1rem'
                }}>
                  <IconShieldTrust size={40} />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#115e59', marginBottom: '0.25rem', fontFamily: 'var(--font-sans)' }}>
                      Strict Data Hygiene & Sovereignty
                    </h3>
                    <p style={{ color: '#0f766e', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      TIMS undergoes automated security auditing, enforces zero third-party advertising cookies, and processes customer information exclusively for your confirmed travel reservations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
