import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

// Require superuser / admin role for this API
async function verifyAdmin(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookies(cookieHeader);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin' && payload.email !== 'superuser2@kilani.com') return null;
  return payload;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  try {
    const db = getDB();
    const result = await db.prepare('SELECT * FROM allowed_teachers ORDER BY created_at DESC').all();
    return NextResponse.json({ emails: result.results });
  } catch (error) {
    console.error('Error fetching allowed emails:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });

    const lowerEmail = email.toLowerCase();
    const db = getDB();

    const existing = await db.prepare('SELECT email FROM allowed_teachers WHERE email = ?').bind(lowerEmail).first();
    if (existing) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مضاف مسبقاً' }, { status: 409 });
    }

    await db.prepare('INSERT INTO allowed_teachers (email, added_by, created_at) VALUES (?, ?, ?)')
      .bind(lowerEmail, admin.sub, new Date().toISOString())
      .run();

    return NextResponse.json({ success: true, email: lowerEmail }, { status: 201 });
  } catch (error) {
    console.error('Error adding allowed email:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });

    const db = getDB();
    await db.prepare('DELETE FROM allowed_teachers WHERE email = ?').bind(email.toLowerCase()).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting allowed email:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
