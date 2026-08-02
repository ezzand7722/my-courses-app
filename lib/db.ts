// D1 type stub - the actual binding is injected at runtime by Cloudflare Pages
// We declare the type locally to avoid needing @cloudflare/workers-types

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
 * Get D1 database from Cloudflare's global env injection.
 * In Cloudflare Pages runtime, bindings appear on globalThis.__env__
 */
export function getDB(): D1Database {
  // 1. Cloudflare Pages production (Next.js Edge runtime injects into globalThis.__env__)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (globalThis as any).__env__;
  if (env?.DB) return env.DB as D1Database;
  
  // 2. Fallback for older adapters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env2 = (process as any).__cloudflareBindings;
  if (env2?.DB) return env2.DB as D1Database;
  
  // 3. Local dev using setupDevPlatform() which patches process.env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((process.env as any).DB) return (process.env as any).DB as D1Database;

  throw new Error('D1 DB binding not available');
}
