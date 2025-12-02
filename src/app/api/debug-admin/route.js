import { NextResponse } from 'next/server';
import initAdmin from '../../../lib/initAdmin';

function tryInitAdmin() {
  try {
    const adminInstance = initAdmin();
    if (!adminInstance) return { initialized: false, reason: 'FIREBASE_SERVICE_ACCOUNT not set' };
    // If initialized, try to pick project_id if available
    const appsCount = adminInstance.apps ? adminInstance.apps.length : 0;
    let project_id = null;
    try {
      const app = adminInstance.apps && adminInstance.apps[0] ? adminInstance.apps[0] : null;
      if (app && app.options) {
        project_id = app.options.projectId || (app.options.credential && app.options.credential.project_id) || null;
      }
    } catch {
      // ignore optional inspection errors
    }
    return { initialized: true, apps: appsCount, project_id };
  } catch (err) {
    return { initialized: false, reason: err.message || String(err) };
  }
}

export async function GET() {
  try {
    const result = tryInitAdmin();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
