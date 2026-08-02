import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ lessons: [] });
    const lessons = await db.prepare(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC'
    ).bind(id).all();
    return NextResponse.json({ lessons: lessons.results || [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    // Verify ownership
    const course = await db.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first() as { teacher_id: string } | null;
    if (!course) return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    if (course.teacher_id !== payload.sub && payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, order_index, video_url, duration_seconds, thumbnail_url } = body;

    if (!title) return NextResponse.json({ error: 'عنوان الدرس مطلوب' }, { status: 400 });

    const lessonId = crypto.randomUUID();
    // Auto-calculate order if not provided
    const maxOrder = await db.prepare(
      'SELECT MAX(order_index) as max_order FROM lessons WHERE course_id = ?'
    ).bind(id).first() as { max_order: number | null };

    const finalOrder = order_index !== undefined ? order_index : (maxOrder?.max_order ?? 0) + 1;

    await db.prepare(
      'INSERT INTO lessons (id, course_id, title, description, order_index, video_url, duration_seconds, thumbnail_url, is_published, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)'
    ).bind(lessonId, id, title, description || '', finalOrder, video_url || null, duration_seconds || 0, thumbnail_url || null, new Date().toISOString()).run();

    const lesson = await db.prepare('SELECT * FROM lessons WHERE id = ?').bind(lessonId).first();
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
