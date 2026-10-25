const https = require('https');

class OAuthService {
  /**
   * Verify Google ID Token (Google Identity Services / One Tap)
   */
  async verifyGoogleToken(idToken) {
    if (!idToken) throw new Error('Google credential token is required');

    // Query Google tokeninfo endpoint
    return new Promise((resolve, reject) => {
      https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.error || data.error_description) {
              return reject(new Error(data.error_description || data.error || 'Invalid Google token'));
            }

            // Verify audience if GOOGLE_CLIENT_ID is configured
            if (process.env.GOOGLE_CLIENT_ID && data.aud !== process.env.GOOGLE_CLIENT_ID) {
              return reject(new Error('Google token client ID mismatch'));
            }

            resolve({
              provider: 'google',
              provider_id: data.sub,
              email: data.email,
              full_name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || 'Google Traveler',
              avatar_url: data.picture || null,
              email_verified: data.email_verified === 'true' || data.email_verified === true
            });
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Verify Apple Identity Token
   */
  async verifyAppleToken(identityToken, fullName = null) {
    if (!identityToken) throw new Error('Apple identity token is required');

    // Decode Apple JWT payload (header.payload.signature)
    const parts = identityToken.split('.');
    if (parts.length < 2) throw new Error('Malformed Apple identity token');

    try {
      const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);

      // Verify expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Apple identity token has expired');
      }

      // Check audience if APPLE_CLIENT_ID is set
      if (process.env.APPLE_CLIENT_ID && payload.aud !== process.env.APPLE_CLIENT_ID) {
        throw new Error('Apple token audience mismatch');
      }

      return {
        provider: 'apple',
        provider_id: payload.sub,
        email: payload.email || `${payload.sub}@privaterelay.appleid.com`,
        full_name: fullName || 'Apple Traveler',
        avatar_url: null,
        email_verified: true
      };
    } catch (err) {
      throw new Error(`Invalid Apple identity token: ${err.message}`);
    }
  }

  /**
   * Verify GitHub OAuth Code & Exchange for Access Token and User Profile
   */
  async verifyGitHubCode(code) {
    if (!code) throw new Error('GitHub authorization code is required');
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured in server/.env');
    }

    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange GitHub authorization code');
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated GitHub user details
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'TIMS-Tourism-App',
        'Accept': 'application/json'
      }
    });

    if (!userRes.ok) {
      throw new Error(`GitHub user API returned ${userRes.status}`);
    }

    const ghUser = await userRes.json();

    // 3. Fetch primary email if not public in profile
    let email = ghUser.email;
    if (!email) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'TIMS-Tourism-App',
            'Accept': 'application/json'
          }
        });
        if (emailsRes.ok) {
          const emails = await emailsRes.json();
          const primary = emails.find(e => e.primary && e.verified) || emails[0];
          if (primary) email = primary.email;
        }
      } catch (err) {
        console.warn('Could not fetch GitHub private emails:', err.message);
      }
    }

    return {
      provider: 'github',
      provider_id: ghUser.id.toString(),
      email: email || `${ghUser.login}@users.noreply.github.com`,
      full_name: ghUser.name || ghUser.login || 'GitHub Traveler',
      username: ghUser.login ? `gh_${ghUser.login}` : undefined,
      avatar_url: ghUser.avatar_url || null,
      email_verified: true
    };
  }
}

module.exports = new OAuthService();

