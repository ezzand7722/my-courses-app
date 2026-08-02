import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const db = getDB();

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
