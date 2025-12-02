import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

function tryInitAdmin() {
  if (admin.apps && admin.apps.length) return { initialized: true };
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) return { initialized: false, reason: 'FIREBASE_SERVICE_ACCOUNT not set' };

  let parsed;
  try {
    if (serviceAccount.trim().startsWith('{')) {
      parsed = JSON.parse(serviceAccount);
    } else {
      const decoded = Buffer.from(serviceAccount, 'base64').toString('utf8');
      parsed = JSON.parse(decoded);
    }
  } catch (e) {
    return { initialized: false, reason: 'Unable to parse FIREBASE_SERVICE_ACCOUNT: ' + e.message };
  }

  try {
    admin.initializeApp({ credential: admin.credential.cert(parsed) });
    return { initialized: true, project_id: parsed.project_id || null };
  } catch (e) {
    return { initialized: false, reason: 'Admin initialize failed: ' + e.message };
  }
}

export async function GET() {
  try {
    const result = tryInitAdmin();
    const apps = admin.apps ? admin.apps.length : 0;
    return NextResponse.json({ ok: true, apps, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
