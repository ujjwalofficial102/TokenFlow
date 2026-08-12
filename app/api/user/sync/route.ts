import { NextRequest, NextResponse } from 'next/server';
import { upsertUserDirect } from '@/lib/postgres/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email, displayName, photoURL } = body;

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await upsertUserDirect(uid, email, displayName, photoURL);
    return NextResponse.json({ success: true, message: 'User profile synced to PostgreSQL' });
  } catch (error: any) {
    console.error('User Sync API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync user to database' },
      { status: 500 }
    );
  }
}
