export default function PrivacyPage() {
  return (
    <div className="page container" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1>Privacy Policy</h1>
        <p>Last updated: October 2024</p>
      </div>

      <div style={{ color: '#52525b', lineHeight: 1.8, fontSize: '1rem' }}>
        <Section title="1. Information We Collect">
          We collect information you provide directly: your name, email address, phone number, 
          and payment details when you create an account or make a booking. We also collect 
          usage data such as pages visited, search queries, and device information automatically.
        </Section>

        <Section title="2. How We Use Your Information">
          Your information is used to: process bookings and payments; send booking confirmations 
          and updates; personalize your travel recommendations; improve our services; and 
          communicate important changes to our platform.
        </Section>

        <Section title="3. Data Sharing">
          We share your information only with: hotel partners and service providers (to fulfill bookings); 
          payment processors (to process transactions); and law enforcement (when legally required). 
          We never sell your personal data to third parties.
        </Section>

        <Section title="4. Data Security">
          We implement industry-standard security measures including encrypted data transmission (HTTPS), 
          hashed password storage, and secure authentication tokens. However, no method of electronic 
          transmission is 100% secure.
        </Section>

        <Section title="5. Cookies">
          We use essential cookies to maintain your login session and preferences. We do not use 
          third-party tracking cookies. You can disable cookies in your browser settings, but 
          this may affect functionality.
        </Section>

        <Section title="6. Your Rights">
          You have the right to: access your personal data; correct inaccurate information; 
          request deletion of your account; and opt out of promotional communications. 
          Contact us to exercise these rights.
        </Section>

        <Section title="7. Data Retention">
          We retain your personal data for as long as your account is active or as needed to 
          provide services. Booking records are kept for a minimum of 3 years for legal and 
          accounting purposes.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this privacy policy periodically. We will notify you of significant changes 
          via email or a prominent notice on our website. Your continued use of TIMS after changes 
          constitutes acceptance.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 700, color: '#09090b', marginBottom: '0.75rem' }}>
        {title}
      </h2>
      <p>{children}</p>
    </div>
  );
}
