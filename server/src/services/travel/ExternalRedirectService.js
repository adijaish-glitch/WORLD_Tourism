const { URL } = require('url');

/**
 * Domain Allowlist for authorized external travel providers & official ticketing partners
 */
const ALLOWED_DOMAINS = [
  'makemytrip.com',
  'www.makemytrip.com',
  'mypartner.makemytrip.com',
  'amadeus.com',
  'developers.amadeus.com',
  'test.api.amadeus.com',
  'irctc.co.in',
  'www.irctc.co.in',
  'irctctourism.com',
  'www.irctctourism.com',
  'redbus.in',
  'www.redbus.in',
  'expedia.com',
  'www.expedia.com',
  'booking.com',
  'www.booking.com',
  'goibibo.com',
  'www.goibibo.com',
  'tims-tourism.onrender.com',
  'localhost',
  '127.0.0.1'
];

/**
 * Disallowed URL protocols to eliminate XSS / code injection
 */
const FORBIDDEN_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

class ExternalRedirectService {
  /**
   * Validate destination URL against security rules & provider allowlist
   * @param {string} rawUrl 
   * @returns {{ safe: boolean, error?: string, parsedUrl?: URL }}
   */
  static validateUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { safe: false, error: 'URL must be a valid non-empty string.' };
    }

    const trimmed = rawUrl.trim();

    // Protocol check
    for (const proto of FORBIDDEN_PROTOCOLS) {
      if (trimmed.toLowerCase().startsWith(proto)) {
        return { safe: false, error: `Unsafe URL scheme detected: ${proto}` };
      }
    }

    let parsed;
    try {
      parsed = new URL(trimmed);
    } catch {
      return { safe: false, error: 'Malformed URL structure.' };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, error: 'Only http and https protocols are permitted.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check if domain or apex domain is on the allowlist
    const isAllowed = ALLOWED_DOMAINS.some(allowed => {
      return hostname === allowed || hostname.endsWith(`.${allowed}`);
    });

    if (!isAllowed) {
      return {
        safe: false,
        error: `Domain '${hostname}' is not authorized. TIMS strictly prevents open redirects to unverified third-party hosts.`
      };
    }

    return { safe: true, parsedUrl: parsed };
  }

  /**
   * Builds an authorized outbound partner redirect URL with safe tracking parameters
   * Strips any sensitive customer PII or authentication credentials
   * @param {string} targetUrl 
   * @param {Object} options 
   */
  static buildSafeRedirect(targetUrl, options = {}) {
    const check = this.validateUrl(targetUrl);
    if (!check.safe) {
      throw new Error(check.error);
    }

    const url = check.parsedUrl;

    // Attach tracking parameters if approved
    if (options.affiliateId) {
      url.searchParams.set('affId', encodeURIComponent(options.affiliateId));
    }
    url.searchParams.set('utm_source', 'TIMS_Travel_Platform');
    url.searchParams.set('utm_medium', 'partner_redirect');
    if (options.category) {
      url.searchParams.set('utm_campaign', `discovery_${options.category}`);
    }

    // Never attach passwords, auth tokens, or payment details
    url.searchParams.delete('token');
    url.searchParams.delete('jwt');
    url.searchParams.delete('password');
    url.searchParams.delete('cvv');
    url.searchParams.delete('card');

    return {
      destinationUrl: url.toString(),
      targetHost: url.hostname,
      providerName: options.providerName || 'Authorized Partner',
      disclaimer: `You are leaving TIMS to complete your booking securely on ${url.hostname}. External bookings are governed by the partner's privacy policy and terms.`
    };
  }
}

module.exports = ExternalRedirectService;

