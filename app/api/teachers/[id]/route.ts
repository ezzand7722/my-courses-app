import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    const teacher = await db.prepare(
      'SELECT id, name, email, avatar_url, bio, created_at FROM users WHERE id = ? AND role IN ("teacher", "admin")'
    ).bind(id).first();

    if (!teacher) return NextResponse.json({ error: 'المعلم غير موجود' }, { status: 404 });

    const courses = await db.prepare(
      'SELECT * FROM courses WHERE teacher_id = ? AND is_published = 1 ORDER BY created_at DESC'
    ).bind(id).all();

    return NextResponse.json({ teacher, courses: courses.results || [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
