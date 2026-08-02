import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const db = getDB();
    const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const userCount = await db.prepare("SELECT COUNT(*) as c FROM users").first();
    return NextResponse.json({
      status: 'ok',
      tables: tables.results,
      userCount,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      globalThisKeys: Object.keys(globalThis),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hasDBOnGlobalThis: typeof (globalThis as any).DB !== 'undefined',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hasDBOnEnv: typeof (globalThis as any).__env__?.DB !== 'undefined',
    }, { status: 500 });
  }
}
