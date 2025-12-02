import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || null;
    if (!raw) return NextResponse.json({ present: false });

    const trimmed = String(raw).trim();
    const startsWithBrace = trimmed.startsWith('{');

    let decodesToJson = false;
    try {
      // Try treating value as base64 -> JSON
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
      JSON.parse(decoded);
      decodesToJson = true;
    } catch {
      decodesToJson = false;
    }

    return NextResponse.json({ present: true, length: trimmed.length, startsWithBrace, decodesToJson });
  } catch (err) {
    return NextResponse.json({ present: false, error: String(err) }, { status: 500 });
  }
}
