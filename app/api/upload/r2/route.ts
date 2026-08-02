import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });

    // Get R2 binding from Cloudflare
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r2 = (globalThis as any).__env__?.R2_BUCKET || (process.env as any).R2_BUCKET;

    if (!r2) {
      // Fallback: store as base64 data URL for dev (not for production)
      return NextResponse.json({
        url: '/placeholder-image.jpg',
        message: 'R2 not configured - using placeholder',
      });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const key = `${folder}/${payload.sub}/${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    await r2.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    const customDomain = process.env.R2_PUBLIC_DOMAIN;
    const url = customDomain
      ? `https://${customDomain}/${key}`
      : `/api/images/${key}`;

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error('R2 upload error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
