export default function TermsPage() {
  return (
    <div className="page container" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1>Terms of Service</h1>
        <p>Last updated: October 2024</p>
      </div>

      <div style={{ color: '#52525b', lineHeight: 1.8, fontSize: '1rem' }}>
        <Section title="1. Acceptance of Terms">
          By accessing or using the TIMS (Travel & Itinerary Management System) website and services, 
          you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </Section>

        <Section title="2. Services">
          TIMS provides travel booking services, including destination browsing, hotel reservations, 
          tour package bookings, and itinerary management. We act as an intermediary between travelers 
          and service providers (hotels, airlines, tour operators).
        </Section>

        <Section title="3. User Accounts">
          You must provide accurate, complete information when creating an account. You are responsible 
          for maintaining the confidentiality of your credentials and for all activities under your account. 
          Notify us immediately of any unauthorized use.
        </Section>

        <Section title="4. Booking & Payments">
          All bookings are subject to availability. Prices are displayed in USD and may include seasonal 
          surcharges. Group discounts are automatically applied based on the number of travelers. 
          Payment is processed securely at the time of booking.
        </Section>

        <Section title="5. Cancellation Policy">
          Confirmed bookings can be cancelled from your dashboard. Cancellation fees may apply depending 
          on the proximity to the check-in date and the specific package terms. Refunds, if applicable, 
          will be processed within 5-10 business days.
        </Section>

        <Section title="6. User Conduct">
          You agree not to: use the platform for any unlawful purpose; submit false reviews; 
          attempt to access other users' accounts; or interfere with the platform's operation.
        </Section>

        <Section title="7. Intellectual Property">
          All content on TIMS — including text, graphics, logos, and software — is the property of TIMS 
          and is protected by intellectual property laws. You may not reproduce, distribute, or create 
          derivative works without prior written consent.
        </Section>

        <Section title="8. Limitation of Liability">
          TIMS is not liable for any indirect, incidental, or consequential damages arising from your 
          use of our services. We are not responsible for the quality of services provided by third-party 
          hotels, airlines, or tour operators.
        </Section>

        <Section title="9. Changes to Terms">
          We reserve the right to modify these terms at any time. Changes will be posted on this page 
          with an updated revision date. Continued use of our services after changes constitutes 
          acceptance of the revised terms.
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
