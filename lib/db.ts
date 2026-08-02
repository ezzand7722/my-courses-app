import { getRequestContext } from '@cloudflare/next-on-pages';

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: object;
}

/**
 * Get D1 database from Cloudflare's runtime environment injection.
 */
export function getDB(): D1Database {
  // 1. Official Cloudflare next-on-pages request context
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = getRequestContext() as any;
    if (ctx?.env?.DB) return ctx.env.DB as D1Database;
  } catch {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = (typeof process !== 'undefined' ? process : {}) as any;

  // 2. Global & process fallbacks
  if (g.DB) return g.DB as D1Database;
  if (g.__env__?.DB) return g.__env__.DB as D1Database;
  if (g.env?.DB) return g.env.DB as D1Database;
  if (p.env?.DB) return p.env.DB as D1Database;
  if (p.__cloudflareBindings?.DB) return p.__cloudflareBindings.DB as D1Database;

  throw new Error('D1 DB binding not available. Ensure D1 binding "DB" is set.');
}
