const admin = require('firebase-admin');

let isInitialized = false;

function initFirebaseAdmin() {
  if (isInitialized) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines in .env
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (admin.apps.length > 0) {
      isInitialized = true;
      return admin;
    }

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      isInitialized = true;
      console.log(`🔥 Firebase Admin SDK initialized for project: ${projectId}`);
    } else if (projectId) {
      admin.initializeApp({
        projectId
      });
      isInitialized = true;
      console.log(`🔥 Firebase Admin SDK initialized with Project ID: ${projectId}`);
    } else {
      console.warn('⚠️ Firebase Admin SDK: Credentials not yet configured in server/.env.');
      console.warn('👉 Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to verify live tokens.');
    }
  } catch (err) {
    console.warn('Firebase Admin SDK initialization note:', err.message);
  }

  return admin;
}

/**
 * Verify Firebase ID Token on the backend
 */
async function verifyFirebaseIdToken(idToken) {
  if (!idToken) throw new Error('Firebase ID token is required');

  initFirebaseAdmin();

  // If Firebase Admin has an active app, use official verification
  if (admin.apps.length > 0) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        phone_number: decodedToken.phone_number || null,
        full_name: decodedToken.name || decodedToken.display_name || null,
        avatar_url: decodedToken.picture || null,
        email_verified: !!decodedToken.email_verified,
        sign_in_provider: decodedToken.firebase?.sign_in_provider || 'firebase'
      };
    } catch (err) {
      console.error('Firebase Admin verifyIdToken error:', err.message);
      throw new Error(`Invalid Firebase ID token: ${err.message}`);
    }
  }

  // Fallback: If Firebase Admin keys are not yet provided in .env during initial setup,
  // decode token payload for dev testing so the developer can verify the flow
  try {
    const parts = idToken.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Firebase token has expired');
      }
      return {
        uid: payload.user_id || payload.sub,
        email: payload.email || null,
        phone_number: payload.phone_number || null,
        full_name: payload.name || null,
        avatar_url: payload.picture || null,
        email_verified: !!payload.email_verified,
        sign_in_provider: payload.firebase?.sign_in_provider || 'firebase'
      };
    }
  } catch (err) {
    throw new Error('Malformed or expired Firebase token');
  }

  throw new Error('Firebase Admin SDK not initialized and token could not be verified');
}

module.exports = {
  admin,
  initFirebaseAdmin,
  verifyFirebaseIdToken
};
