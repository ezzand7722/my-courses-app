import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, signToken, createSessionCookie } from '@/lib/auth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }

    const db = getDB();
    const lowerEmail = email.toLowerCase();

    // Check if email already exists
    const existing = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(lowerEmail)
      .first();

    if (existing) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    // Whitelist check: allow if superuser or if in allowed_teachers table
    if (lowerEmail !== 'superuser2@kilani.com') {
      const isAllowed = await db
        .prepare('SELECT email FROM allowed_teachers WHERE email = ?')
        .bind(lowerEmail)
        .first();
      
      if (!isAllowed) {
        return NextResponse.json({ error: 'غير مصرح لهذا البريد الإلكتروني بالتسجيل كمعلم. يرجى التواصل مع الإدارة.' }, { status: 403 });
      }
    }

    // Determine role
    const role = lowerEmail === 'superuser2@kilani.com' ? 'admin' : 'teacher';

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db
      .prepare(
        'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, name, lowerEmail, passwordHash, role, new Date().toISOString())
      .run();

    // Create session
    const token = await signToken({
      sub: userId,
      email: lowerEmail,
      name,
      role: role as 'admin' | 'teacher',
    });

    const response = NextResponse.json(
      { success: true, user: { id: userId, name, email: lowerEmail, role } },
      { status: 201 }
    );
    response.headers.set('Set-Cookie', createSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى' },
      { status: 500 }
    );
  }
}
