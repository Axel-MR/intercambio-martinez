import { NextResponse } from 'next/server';
import initAdmin from '../../../lib/initAdmin';

export async function POST(req) {
  try {
    const adminInstance = initAdmin();
    if (!adminInstance) {
      return NextResponse.json({ error: 'FIREBASE_SERVICE_ACCOUNT is not set on server' }, { status: 500 });
    }
    const body = await req.json();
    const providedToken = body?.token;
    if (!providedToken) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    const db = adminInstance.firestore();
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
      await adminInstance.firestore().runTransaction(async (tx) => {
        const freshSnap = await tx.get(userRef);
        if (!freshSnap.exists) {
          throw new Error('Usuario no encontrado');
        }
        const data = freshSnap.data();
        if (!data.loginToken || data.loginToken !== providedToken) {
          throw new Error('Token inválido');
        }

        tx.update(userRef, {
          tokenUsedAt: adminInstance.firestore.FieldValue.serverTimestamp()
        });
      });
    } catch (txErr) {
      console.warn('Transaction failed or token invalid:', txErr.message || txErr);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Create a Firebase custom token for the uid after the token has been consumed
    const customToken = await adminInstance.auth().createCustomToken(uid);
    return NextResponse.json({ customToken });
  } catch (err) {
    console.error('Error in token-login route:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
