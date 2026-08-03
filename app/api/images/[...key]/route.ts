import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r2 = (globalThis as any).__env__?.R2_BUCKET || (process.env as any).R2_BUCKET;

    if (!r2) {
      return new Response('R2 bucket not configured', { status: 500 });
    }

    const { key } = await params;
    const objectKey = key.join('/');

    const object = await r2.get(objectKey);

    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    // Cache for 1 day
    headers.set('cache-control', 'public, max-age=86400');

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error('Fetch R2 image error:', error);
    return new Response('Error loading image', { status: 500 });
  }
}
