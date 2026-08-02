import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
    if (!db) return NextResponse.json({ teachers: [] });

    const result = await db.prepare(`
      SELECT u.id, u.name, u.email, u.avatar_url, u.bio, u.created_at,
             COUNT(c.id) as course_count
      FROM users u
      LEFT JOIN courses c ON c.teacher_id = u.id AND c.is_published = 1
      WHERE u.role IN ('teacher', 'admin')
      GROUP BY u.id
      ORDER BY u.created_at ASC
    `).all();

    return NextResponse.json({ teachers: result.results || [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
