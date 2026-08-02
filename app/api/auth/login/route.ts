import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, signToken, createSessionCookie } from '@/lib/auth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const db = getDB();

    if (!db) {
      return NextResponse.json(
        { error: 'قاعدة البيانات غير متاحة' },
        { status: 500 }
      );
    }

    // Find user
    const user = await db
      .prepare('SELECT * FROM users WHERE email = ? AND role IN ("teacher", "admin")')
      .bind(email.toLowerCase())
      .first() as {
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: 'teacher' | 'admin';
        avatar_url?: string;
      } | null;

    if (!user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
    });
    response.headers.set('Set-Cookie', createSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
