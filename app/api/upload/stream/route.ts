import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import { createDirectUpload } from '@/lib/stream';

export const runtime = 'edge';

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
    const { courseId } = body;

    if (courseId) {
      // Verify teacher owns this course
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (globalThis as any).__env__?.DB || (process.env as any).DB;
      if (db) {
        const course = await db.prepare('SELECT teacher_id FROM courses WHERE id = ?').bind(courseId).first() as { teacher_id: string } | null;
        if (course && course.teacher_id !== payload.sub && payload.role !== 'admin') {
          return NextResponse.json({ error: 'غير مصرح للوصول لهذه الدورة' }, { status: 403 });
        }
      }
    }

    const accountId = process.env.CF_ACCOUNT_ID;
    const apiToken = process.env.CF_STREAM_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'إعدادات Cloudflare Stream غير مكتملة' },
        { status: 500 }
      );
    }

    const { uid, uploadURL } = await createDirectUpload(accountId, apiToken);

    return NextResponse.json({ uid, uploadURL });
  } catch (error) {
    console.error('Stream upload error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
