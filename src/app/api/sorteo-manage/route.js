import { NextResponse } from 'next/server';
import initAdmin from '../../../lib/initAdmin';

async function verifyAdmin(adminInstance, idToken) {
  try {
    const decoded = await adminInstance.auth().verifyIdToken(idToken);
    const callerUid = decoded.uid;
    const db = adminInstance.firestore();
    const callerDoc = await db.collection('usuarios').doc(callerUid).get();
    if (!callerDoc.exists || callerDoc.data().role !== 'admin') return { ok: false, callerUid };
    return { ok: true, callerUid };
  } catch (err) {
    console.error('verifyAdmin error:', err);
    return { ok: false };
  }
}

export async function POST(req) {
  try {
    const adminInstance = initAdmin();
    if (!adminInstance) return NextResponse.json({ error: 'FIREBASE_SERVICE_ACCOUNT not configured' }, { status: 500 });
    const db = adminInstance.firestore();

    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header missing or invalid' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    const verified = await verifyAdmin(adminInstance, idToken);
    if (!verified.ok) return NextResponse.json({ error: 'Caller is not admin or token invalid' }, { status: 403 });

    const body = await req.json();
    const { action, sorteoId, updates = {} } = body || {};
    if (!action || !sorteoId) return NextResponse.json({ error: 'action and sorteoId required' }, { status: 400 });

    const sorteoRef = db.collection('sorteos').doc(sorteoId);
    const sorteoSnap = await sorteoRef.get();
    if (!sorteoSnap.exists) return NextResponse.json({ error: 'Sorteo not found' }, { status: 404 });

    if (action === 'delete') {
      // Delete assignments, participantes, and clear assignedTo on usuarios
      const assignmentsSnap = await sorteoRef.collection('assignments').get();
      const batchLimit = 450;
      let batch = db.batch();
      let opCount = 0;

      for (const docSnap of assignmentsSnap.docs) {
        const fromUid = docSnap.id;
        batch.delete(sorteoRef.collection('assignments').doc(fromUid));
        const userRef = db.collection('usuarios').doc(fromUid);
        batch.update(userRef, {
          assignedTo: adminInstance.firestore.FieldValue.delete(),
          sorteoAssigned: adminInstance.firestore.FieldValue.delete()
        });
        opCount += 2;
        if (opCount >= batchLimit) { await batch.commit(); batch = db.batch(); opCount = 0; }
      }

      const participantesSnap = await db.collection('participantes').where('sorteoId', '==', sorteoId).get();
      for (const p of participantesSnap.docs) {
        batch.delete(db.collection('participantes').doc(p.id));
        opCount += 1;
        if (opCount >= batchLimit) { await batch.commit(); batch = db.batch(); opCount = 0; }
      }

      batch.delete(sorteoRef);
      await batch.commit();

      return NextResponse.json({ ok: true, message: 'Sorteo and related data deleted' });
    }

    if (action === 'update') {
      await sorteoRef.update(updates);
      return NextResponse.json({ ok: true, message: 'Sorteo updated' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('sorteo-manage error:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
