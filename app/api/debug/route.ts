import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  return NextResponse.json({
    keys: Object.keys(process.env).filter(k => typeof process.env[k] !== 'string'),
    envKeys: Object.keys(process.env),
    globalEnv: typeof (globalThis as any).__env__ !== 'undefined' ? Object.keys((globalThis as any).__env__) : null,
    processCfBindings: typeof (process as any).__cloudflareBindings !== 'undefined' ? Object.keys((process as any).__cloudflareBindings) : null,
    reqCf: (request as any).cf ? Object.keys((request as any).cf) : null,
  });
}
