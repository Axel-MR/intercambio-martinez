import { NextResponse } from 'next/server';
import initAdmin from '../../../lib/initAdmin';

function tryInitAdmin() {
  try {
    const adminInstance = initAdmin();
    if (!adminInstance) return { initialized: false, reason: 'FIREBASE_SERVICE_ACCOUNT not set' };
    // If initialized, try to pick project_id if available
    const apps = adminInstance.apps ? adminInstance.apps.length : 0;
    // attempt to read project_id from credential if possible
    let project_id = null;
    try {
      const cert = adminInstance?.app?.options?.credential || null;
      // not all runtimes expose cert here; leave null if not available
    } catch (e) {
      // ignore
    }
    return { initialized: true, project_id };
  } catch (err) {
    return { initialized: false, reason: err.message || String(err) };
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
