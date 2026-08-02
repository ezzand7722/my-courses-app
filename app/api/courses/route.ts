import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) {
      return NextResponse.json({ courses: [] });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const teacherId = searchParams.get('teacher_id');
    const publishedOnly = searchParams.get('published') !== 'false';

    let query = `
      SELECT c.*, u.name as teacher_name, u.avatar_url as teacher_avatar,
             COUNT(l.id) as lesson_count
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN lessons l ON l.course_id = c.id AND l.is_published = 1
    `;
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (publishedOnly) { conditions.push('c.is_published = 1'); }
    if (subject) { conditions.push('c.subject = ?'); bindings.push(subject); }
    if (teacherId) { conditions.push('c.teacher_id = ?'); bindings.push(teacherId); }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const stmt = db.prepare(query);
    const result = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all();
    return NextResponse.json({ courses: result.results || [] });
  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'teacher' && payload.role !== 'admin')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, cover_image_url } = body;

    if (!title || !subject) {
      return NextResponse.json({ error: 'العنوان والمادة مطلوبان' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    const courseId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db
      .prepare(
        'INSERT INTO courses (id, teacher_id, title, description, subject, cover_image_url, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)'
      )
      .bind(courseId, payload.sub, title, description || '', subject, cover_image_url || null, now, now)
      .run();

    const course = await db.prepare('SELECT * FROM courses WHERE id = ?').bind(courseId).first();
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
