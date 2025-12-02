import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) return null;
  let parsed;
  try {
    if (serviceAccount.trim().startsWith('{')) parsed = JSON.parse(serviceAccount);
    else parsed = JSON.parse(Buffer.from(serviceAccount, 'base64').toString('utf8'));
  } catch (e) {
    throw new Error('Unable to parse FIREBASE_SERVICE_ACCOUNT: ' + e.message);
  }
  admin.initializeApp({ credential: admin.credential.cert(parsed) });
  return admin;
}

// Helper: build allowed map and run backtracking to find perfect matching
function buildAllowedMap(uids, exclusionsMap) {
  const allowed = new Map();
  for (const uid of uids) {
    const set = new Set();
    for (const other of uids) {
      if (other === uid) continue;
      const forbidden = exclusionsMap.get(uid);
      if (forbidden && forbidden.has(other)) continue;
      set.add(other);
    }
    allowed.set(uid, set);
  }
  return allowed;
}

function findMatching(uids, allowed) {
  // Order uids by ascending domain size (heuristic)
  const order = [...uids].sort((a, b) => allowed.get(a).size - allowed.get(b).size);
  const used = new Set();
  const result = new Map();

  function backtrack(i) {
    if (i === order.length) return true;
    const uid = order[i];
    // iterate over candidates in random order to avoid deterministic patterns
    const candidates = [...allowed.get(uid)];
    for (let k = candidates.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      const tmp = candidates[k];
      candidates[k] = candidates[j];
      candidates[j] = tmp;
    }
    for (const cand of candidates) {
      if (used.has(cand)) continue;
      used.add(cand);
      result.set(uid, cand);
      if (backtrack(i + 1)) return true;
      used.delete(cand);
      result.delete(uid);
    }
    return false;
  }

  const ok = backtrack(0);
  return ok ? result : null;
}

export async function POST(req) {
  try {
    const adminInstance = initAdmin();
    if (!adminInstance) {
      return NextResponse.json({ error: 'FIREBASE_SERVICE_ACCOUNT not configured' }, { status: 500 });
    }
    const db = adminInstance.firestore();

    // Verify caller is admin via Firebase ID token in Authorization header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header missing or invalid' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    let callerUid;
    try {
      const decoded = await adminInstance.auth().verifyIdToken(idToken);
      callerUid = decoded.uid;
      // Optionally check custom claims
    } catch (e) {
      console.error('Token verification failed', e);
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
    }

    // Ensure caller is admin by checking Firestore user role
    const callerDoc = await db.collection('usuarios').doc(callerUid).get();
    if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
      return NextResponse.json({ error: 'Caller is not admin' }, { status: 403 });
    }

    const body = await req.json();
    const { sorteoId = `sorteo-${Date.now()}`, participants: providedParticipants, exclusions = [], nombre = null, descripcion = null } = body || {};

    // Load participants: if provided as array of uids, use it. Otherwise query usuarios with status==true
    let participantsDocs;
    if (Array.isArray(providedParticipants) && providedParticipants.length > 0) {
      const refs = providedParticipants.map((uid) => db.collection('usuarios').doc(uid));
      const snaps = await Promise.all(refs.map((r) => r.get()));
      participantsDocs = snaps.filter((s) => s.exists).map((s) => ({ uid: s.id, data: s.data() }));
    } else {
      const snap = await db.collection('usuarios').where('status', '==', true).get();
      participantsDocs = snap.docs.map((d) => ({ uid: d.id, data: d.data() }));
    }

    if (participantsDocs.length < 2) return NextResponse.json({ error: 'Need at least 2 participants' }, { status: 400 });

    const uids = participantsDocs.map((p) => p.uid);
    const uidToUser = new Map(participantsDocs.map((p) => [p.uid, p.data]));
    const usernameToUid = new Map(participantsDocs.map((p) => [String(p.data.username).trim(), p.uid]));

    // Build exclusions map: Map<uid, Set<forbiddenUid>>
    const exclusionsMap = new Map();
    for (const ex of exclusions) {
      // ex: { from: 'Sam'|'uid', forbid: ['Amado'|'uid'] }
      const from = ex.from;
      const forbidList = ex.forbid || ex.forbidings || ex.forbidden || ex.forbids || ex.forbidsTo || ex.forbiddenTo || ex.forbid || [];
      let fromUid = from;
      if (usernameToUid.has(String(from).trim())) fromUid = usernameToUid.get(String(from).trim());
      if (!uids.includes(fromUid)) continue; // unknown
      const set = exclusionsMap.get(fromUid) || new Set();
      for (const f of forbidList) {
        let fUid = f;
        if (usernameToUid.has(String(f).trim())) fUid = usernameToUid.get(String(f).trim());
        if (uids.includes(fUid)) set.add(fUid);
      }
      exclusionsMap.set(fromUid, set);
    }

    // Build allowed map and check for impossibilities
    const allowed = buildAllowedMap(uids, exclusionsMap);
    for (const [uid, set] of allowed.entries()) {
      if (set.size === 0) {
        return NextResponse.json({ error: `No available candidates for user ${uid}` }, { status: 400 });
      }
    }

    // Try to find matching
    const match = findMatching(uids, allowed);
    if (!match) {
      return NextResponse.json({ error: 'Unable to find valid matching with given constraints' }, { status: 400 });
    }


    // Commit assignments with batch; also persist nombre/descripcion and create participantes docs
    const batch = db.batch();
    const sorteoRef = db.collection('sorteos').doc(sorteoId);
    const sorteoData = {
      participants: uids,
      createdAt: adminInstance.firestore.FieldValue.serverTimestamp(),
      status: 'finished',
      estado: 'Listo'
    };
    if (nombre) sorteoData.nombre = nombre;
    if (descripcion) sorteoData.descripcion = descripcion;
    batch.set(sorteoRef, sorteoData, { merge: true });

    const assignmentsCollection = sorteoRef.collection('assignments');
    for (const [fromUid, toUid] of match.entries()) {
      const assignRef = assignmentsCollection.doc(fromUid);
      const toUser = uidToUser.get(toUid) || {};
      batch.set(assignRef, {
        assignedToUid: toUid,
        assignedToUsername: toUser.username || null,
        assignedAt: adminInstance.firestore.FieldValue.serverTimestamp()
      });
      // also update user doc for quick lookup
      const userRef = db.collection('usuarios').doc(fromUid);
      batch.update(userRef, {
        assignedTo: toUid,
        sorteoAssigned: sorteoId
      });

      // Create or update a participantes document so the client UI picks it up
      // Use deterministic ID to avoid duplicates: `${sorteoId}_${fromUid}`
      const participanteDocRef = db.collection('participantes').doc(`${sorteoId}_${fromUid}`);
      const fromUserData = uidToUser.get(fromUid) || {};
      batch.set(participanteDocRef, {
        userId: fromUid,
        sorteoId,
        nombreInscrito: fromUserData.username || null,
        username: fromUserData.username || null,
        amigoSecretoId: toUid,
        asignedDate: adminInstance.firestore.FieldValue.serverTimestamp(),
        disponible: false,
        participacionConfirmado: true,
        inscripcionDate: fromUserData.createdAt || adminInstance.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    batch.update(sorteoRef, {
      status: 'finished',
      estado: 'Listo',
      assignmentsCompleteAt: adminInstance.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    // Build response with mapping
    const result = [];
    for (const [from, to] of match.entries()) {
      result.push({ fromUid: from, fromUsername: uidToUser.get(from)?.username || null, toUid: to, toUsername: uidToUser.get(to)?.username || null });
    }

    return NextResponse.json({ sorteoId, assignments: result });
  } catch (err) {
    console.error('sorteo-batch error:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
