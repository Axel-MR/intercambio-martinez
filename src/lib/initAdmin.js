import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  // Support multiple env var names
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || null;

  // If FIREBASE_SERVICE_ACCOUNT not provided, optionally allow GOOGLE_APPLICATION_CREDENTIALS
  if (!raw) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Resolve path and verify the file exists before letting the SDK use it.
      const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const resolved = path.isAbsolute(gac) ? gac : path.resolve(process.cwd(), gac);
      if (!fs.existsSync(resolved)) {
        throw new Error(
          `GOOGLE_APPLICATION_CREDENTIALS is set but file not found at ${resolved}. ` +
            'Remove this env var and set `FIREBASE_SERVICE_ACCOUNT` (base64) in Vercel instead.'
        );
      }
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
