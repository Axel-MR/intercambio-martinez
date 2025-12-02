import admin from 'firebase-admin';

function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  // Support multiple env var names
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || null;

  // If GOOGLE_APPLICATION_CREDENTIALS is set, let the SDK pick it up
  if (!raw) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        admin.initializeApp();
        return admin;
      } catch (e) {
        throw new Error('Admin initialize failed using GOOGLE_APPLICATION_CREDENTIALS: ' + e.message);
      }
    }
    return null;
  }

  let parsed;
  try {
    const s = String(raw).trim();
    if (s.startsWith('{')) {
      parsed = JSON.parse(s);
    } else {
      // treat as base64
      const decoded = Buffer.from(s, 'base64').toString('utf8');
      parsed = JSON.parse(decoded);
    }
  } catch (e) {
    throw new Error('Unable to parse FIREBASE_SERVICE_ACCOUNT JSON: ' + e.message);
  }

  try {
    admin.initializeApp({ credential: admin.credential.cert(parsed) });
    return admin;
  } catch (e) {
    throw new Error('Admin initialize failed: ' + e.message);
  }
}

export default initAdmin;
