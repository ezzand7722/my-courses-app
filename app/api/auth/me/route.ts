import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies, signToken, createSessionCookie } from '@/lib/auth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        avatar_url: payload.avatar_url,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json() as { avatar_url?: string | null; name?: string };
    const db = getDB();

    // Update avatar_url in DB
    if ('avatar_url' in body) {
      await db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?')
        .bind(body.avatar_url ?? null, payload.sub)
        .run();
    }
    if (body.name) {
      await db.prepare('UPDATE users SET name = ? WHERE id = ?')
        .bind(body.name, payload.sub)
        .run();
    }

    // Re-sign JWT with updated fields
    const newToken = await signToken({
      sub: payload.sub,
      email: payload.email,
      name: body.name || payload.name,
      role: payload.role,
      avatar_url: 'avatar_url' in body ? (body.avatar_url ?? undefined) : payload.avatar_url,
    });

    const res = NextResponse.json({ success: true });
    res.headers.set('Set-Cookie', createSessionCookie(newToken));
    return res;
  } catch (error) {
    console.error('PATCH me error:', error);
    return NextResponse.json({ error: 'فشل التحديث' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', 'teacher_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
  return res;
}
