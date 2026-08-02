import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ courses: [], teachers: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ courses: [], teachers: [] });

    const searchTerm = `%${q}%`;

    const courses = await db.prepare(`
      SELECT c.*, u.name as teacher_name, u.avatar_url as teacher_avatar,
             COUNT(l.id) as lesson_count
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN lessons l ON l.course_id = c.id AND l.is_published = 1
      WHERE c.is_published = 1 AND (c.title LIKE ? OR c.description LIKE ? OR c.subject LIKE ?)
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 20
    `).bind(searchTerm, searchTerm, searchTerm).all();

    const teachers = await db.prepare(`
      SELECT id, name, avatar_url, bio FROM users
      WHERE role IN ('teacher', 'admin') AND (name LIKE ? OR bio LIKE ?)
      LIMIT 10
    `).bind(searchTerm, searchTerm).all();

    return NextResponse.json({
      courses: courses.results || [],
      teachers: teachers.results || [],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
