import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const { id, lessonId } = await params;
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    const course = await db.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first() as { teacher_id: string } | null;
    if (!course) return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    if (course.teacher_id !== payload.sub && payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, order_index, video_url, duration_seconds, thumbnail_url, is_published } = body;

    await db.prepare(
      'UPDATE lessons SET title=?, description=?, order_index=?, video_url=?, duration_seconds=?, thumbnail_url=?, is_published=? WHERE id=? AND course_id=?'
    ).bind(title, description, order_index, video_url, duration_seconds || 0, thumbnail_url, is_published ? 1 : 0, lessonId, id).run();

    const lesson = await db.prepare('SELECT * FROM lessons WHERE id = ?').bind(lessonId).first();
    return NextResponse.json({ lesson });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const { id, lessonId } = await params;
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    const course = await db.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first() as { teacher_id: string } | null;
    if (!course) return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    if (course.teacher_id !== payload.sub && payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    await db.prepare('DELETE FROM lessons WHERE id = ? AND course_id = ?').bind(lessonId, id).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
