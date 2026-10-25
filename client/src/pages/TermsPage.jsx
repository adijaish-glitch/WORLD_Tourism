import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const sections = [
    {
      id: 'acceptance',
      number: '01',
      title: 'Acceptance of Terms',
      icon: '📜',
      content: `By accessing, browsing, or utilizing the TIMS (Tourism & Itinerary Management System) web platform, mobile applications, or connected APIs, you enter into a legally binding agreement to comply with and be bound by these Terms of Service. If you do not consent to all provisions set forth herein, you must immediately discontinue use of the platform.`
    },
    {
      id: 'eligibility',
      number: '02',
      title: 'Eligibility & User Accounts',
      icon: '👤',
      content: `You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to establish an account or complete reservations on TIMS. When registering via email, username, phone SMS OTP, or third-party OAuth providers (such as Google or Apple), you agree to provide authentic, accurate, and current information. You are solely responsible for safeguarding your authentication credentials, session tokens, and any activities conducted under your profile.`
    },
    {
      id: 'services',
      number: '03',
      title: 'Services & Intermediary Role',
      icon: '🌐',
      content: `TIMS provides an integrated travel management ecosystem allowing travelers to discover curated global destinations, explore 3D geographical atlases, compare boutique accommodation options, and book bespoke travel packages. TIMS acts as an authorized intermediary connecting you with certified airlines, luxury hoteliers, and licensed tour operators. While we curate and verify our partners vigorously, each third-party supplier retains independent operational responsibility for on-ground services.`
    },
    {
      id: 'pricing',
      number: '04',
      title: 'Pricing, Currencies & Dynamic Discounts',
      icon: '💳',
      content: `All package and room prices are displayed with transparent fee breakdowns, including applicable tourist taxes and service surcharges. Group bookings dynamically reflect tier-based savings according to passenger volume. Payments are processed through PCI-DSS compliant gateways utilizing cryptographic encryption. TIMS never stores raw credit card CVVs or complete PAN credentials on our local servers.`
    },
    {
      id: 'cancellation',
      number: '05',
      title: 'Cancellation, Rescheduling & Refund Policy',
      icon: '🔄',
      content: `Confirmed reservations can be managed directly via your personal Traveler Dashboard. Standard tour packages offer flexible cancellations:
• Full Refund (100%): Cancellations initiated at least 14 days prior to departure.
• Partial Refund (70%): Cancellations initiated between 7 and 13 days prior to departure.
• Non-Refundable Period: Cancellations made under 7 days may incur supplier non-refundable fees.
Approved refunds are credited to the original payment method within 5 to 10 standard business days.`
    },
    {
      id: 'conduct',
      number: '06',
      title: 'Traveler Code of Conduct & Verified Reviews',
      icon: '✨',
      content: `We foster an inclusive, respectful global travel community. Users agree not to post defamatory, fraudulent, or abusive reviews. Review submissions are restricted to travelers with confirmed, completed bookings to preserve verified integrity. TIMS reserves the right to suspend accounts engaged in automated scraping, malicious probing, or fraudulent reservation practices.`
    },
    {
      id: 'intellectual',
      number: '07',
      title: 'Intellectual Property Rights',
      icon: '🛡️',
      content: `All design systems, proprietary 3D globe visualizations, algorithms, trademarks, UI code, brand assets, and compiled country atlas datasets are the exclusive intellectual property of TIMS and its licensors. No portion of this platform may be copied, reverse-engineered, reproduced, or exploited without our express prior written permission.`
    },
    {
      id: 'liability',
      number: '08',
      title: 'Limitation of Liability & Travel Insurance',
      icon: '⚖️',
      content: `To the fullest extent permitted by applicable law, TIMS is not liable for indirect, incidental, punitive, or consequential losses, nor for disruptions caused by natural events, border closures, flight cancellations, or vendor force majeure. We strongly advise every traveler to obtain comprehensive travel, medical, and cancellation insurance prior to departure.`
    },
    {
      id: 'modifications',
      number: '09',
      title: 'Modifications to Service & Terms',
      icon: '📝',
      content: `TIMS reserves the right to periodically revise these Terms of Service to reflect system enhancements, statutory updates, or new regulatory standards. Material amendments will be highlighted via notice banners or registered email dispatches. Your continued interaction with the platform following publication establishes acceptance of the updated terms.`
    },
    {
      id: 'contact',
      number: '10',
      title: 'Governing Law & Dispute Resolution',
      icon: '🏛️',
      content: `These terms are governed by and construed in accordance with international commercial arbitration standards and applicable municipal law. Any dispute arising out of or in connection with TIMS shall be resolved initially through amicable good-faith mediation before formal administrative proceedings.`
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

  const handlePrint = () => {
    window.print();
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
      
      {/* ─── Hero Section ─── */}
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
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '1100px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.4rem 1.1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span>⚖️</span> Legal & Compliance Documentation • Version 2.4
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
            Terms of <span className="italic" style={{ color: '#5eead4' }}>Service</span>
          </h1>

          <p style={{
            color: '#a1a1aa',
            fontSize: '1.1rem',
            maxWidth: '680px',
            lineHeight: 1.7,
            marginBottom: '2rem'
          }}>
            Welcome to TIMS. These terms govern your rights, obligations, reservations, and use of our worldwide tourism and itinerary management platform.
          </p>

          {/* Quick Meta Stats / Highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2.5rem',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📅</div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', fontWeight: 600 }}>Last Revised</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f4f4f5' }}>October 2026</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🌍</div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', fontWeight: 600 }}>Jurisdiction</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f4f4f5' }}>Global & Cross-Border</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🔒</div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', fontWeight: 600 }}>Payment Security</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f4f4f5' }}>PCI-DSS Level 1 Encrypted</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>💬</div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.05em', fontWeight: 600 }}>Support Access</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f4f4f5' }}>24/7 Dedicated Care</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Container with Sidebar ─── */}
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
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }}>🔍</span>
            <input
              type="text"
              placeholder="Search terms, refunds, booking clauses..."
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
                ✕
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
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
              {copied ? '✓ Link Copied!' : '🔗 Share Link'}
            </button>
            
            <button
              onClick={handlePrint}
              className="btn"
              style={{
                background: '#f4f4f5',
                color: '#18181b',
                padding: '0.6rem 1.1rem',
                fontSize: '0.85rem',
                border: '1px solid #e4e4e7'
              }}
            >
              🖨️ Print Agreement
            </button>

            <Link
              to="/privacy"
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
            >
              Privacy Policy →
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
          
          {/* Left: Sticky Table of Contents Sidebar */}
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
                <span>Table of Contents</span>
                <span style={{ background: '#f4f4f5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>{sections.length} Sections</span>
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

              {/* Need Assistance Card */}
              <div style={{ marginTop: '1.75rem', padding: '1.1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#09090b', marginBottom: '0.35rem' }}>
                  Have questions about these terms?
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  Our legal and traveler support specialists are available round the clock.
                </p>
                <a
                  href="mailto:support@tims-tourism.com"
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
                  ✉️ legal@tims-tourism.com →
                </a>
              </div>
            </div>
          </aside>

          {/* Right: Detailed Terms Sections */}
          <main style={{ gridColumn: 'span 8' }}>
            {filteredSections.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #e4e4e7' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.25rem', color: '#18181b', marginBottom: '0.5rem' }}>No matching clauses found</h3>
                <p style={{ color: '#71717a', fontSize: '0.95rem' }}>Try searching for a different keyword or clear the search field to view all terms.</p>
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
                          {sec.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#a1a1aa', fontWeight: 600 }}>SECTION {sec.number}</div>
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
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ fontSize: '2.5rem' }}>🛡️</div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem', fontFamily: 'var(--font-sans)' }}>
                      Travel With Confidence
                    </h3>
                    <p style={{ color: '#15803d', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      Every reservation made through TIMS includes verified hotel partner protection, secure payment escrow handling, and 24/7 emergency traveler concierge support.
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
