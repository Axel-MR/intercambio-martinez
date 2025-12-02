import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin with service account from env var
function initAdmin() {
  if (admin.apps && admin.apps.length) return;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    // throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
    // Prefer returning an explicit value so the route can handle it gracefully
    return null;
  }
  let parsed;
  try {
    // Allow either raw JSON string or base64-encoded JSON
    if (serviceAccount.trim().startsWith('{')) {
      parsed = JSON.parse(serviceAccount);
    } else {
      const decoded = Buffer.from(serviceAccount, 'base64').toString('utf8');
      parsed = JSON.parse(decoded);
    }
  } catch (e) {
    throw new Error('Unable to parse FIREBASE_SERVICE_ACCOUNT JSON: ' + e.message);
  }

  admin.initializeApp({
    credential: admin.credential.cert(parsed)
  });
}

export async function POST(req) {
  try {
    const initResult = initAdmin();
    if (initResult === null) {
      return NextResponse.json({ error: 'FIREBASE_SERVICE_ACCOUNT is not set on server' }, { status: 500 });
    }
    const body = await req.json();
    const providedToken = body?.token;
    if (!providedToken) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    const db = admin.firestore();
    const usersRef = db.collection('usuarios');
    const q = usersRef.where('loginToken', '==', providedToken).limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userDoc = snapshot.docs[0];
    const uid = userDoc.id;
    const userRef = userDoc.ref;

    // Use a transaction to ensure the token is marked as used atomically
    try {
      await admin.firestore().runTransaction(async (tx) => {
        const freshSnap = await tx.get(userRef);
        if (!freshSnap.exists) {
          throw new Error('Usuario no encontrado');
        }
        const data = freshSnap.data();
        if (!data.loginToken || data.loginToken !== providedToken) {
          throw new Error('Token inválido');
        }

        // Do NOT delete the loginToken so it remains reusable.
        // Only mark when it was used.
        tx.update(userRef, {
          tokenUsedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    } catch (txErr) {
      console.warn('Transaction failed or token invalid:', txErr.message || txErr);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Create a Firebase custom token for the uid after the token has been consumed
    const customToken = await admin.auth().createCustomToken(uid);
    return NextResponse.json({ customToken });
  } catch (err) {
    console.error('Error in token-login route:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
