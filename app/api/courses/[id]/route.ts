import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    const course = await db.prepare(`
      SELECT c.*, u.name as teacher_name, u.avatar_url as teacher_avatar, u.bio as teacher_bio, u.id as teacher_id_ref
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `).bind(id).first();

    if (!course) return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });

    const lessons = await db.prepare(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC'
    ).bind(id).all();

    return NextResponse.json({ course, lessons: lessons.results || [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const course = await db.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first() as { teacher_id: string } | null;
    if (!course) return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    if (course.teacher_id !== payload.sub && payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, subject, cover_image_url, is_published } = body;

    await db
      .prepare('UPDATE courses SET title=?, description=?, subject=?, cover_image_url=?, is_published=?, updated_at=? WHERE id=?')
      .bind(title, description, subject, cover_image_url, is_published ? 1 : 0, new Date().toISOString(), id)
      .run();

    const updated = await db.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first();
    return NextResponse.json({ course: updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const course = await db.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first() as { teacher_id: string } | null;
    if (!course) return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    if (course.teacher_id !== payload.sub && payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    await db.prepare('DELETE FROM lessons WHERE course_id = ?').bind(id).run();
    await db.prepare('DELETE FROM courses WHERE id = ?').bind(id).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
