import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = getDB();

    const teacher = await db.prepare(
      'SELECT id, name, email, avatar_url, bio, created_at FROM users WHERE id = ? AND role IN ("teacher", "admin")'
    ).bind(id).first();

    if (!teacher) return NextResponse.json({ error: 'المعلم غير موجود' }, { status: 404 });

    const courses = await db.prepare(`
      SELECT c.*, COUNT(l.id) as lesson_count
      FROM courses c
      LEFT JOIN lessons l ON l.course_id = c.id AND l.is_published = 1
      WHERE c.teacher_id = ? AND c.is_published = 1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).bind(id).all();

    return NextResponse.json({ teacher, courses: courses.results || [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
