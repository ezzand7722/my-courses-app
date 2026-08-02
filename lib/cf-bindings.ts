/**
 * Cloudflare Pages binding accessor for Next.js App Router
 * 
 * In Cloudflare Pages with Next.js, the D1/R2 bindings are injected
 * into the Next.js request context via the platform adapter.
 * 
 * The `getCloudflareContext` function from @cloudflare/next-on-pages
 * is the canonical way to access bindings in App Router API routes.
 * 
 * For local development, use `wrangler pages dev` which injects bindings.
 */

// Type definitions for Cloudflare bindings
export interface CloudflareEnv {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  JWT_SECRET?: string;
  CF_ACCOUNT_ID?: string;
  CF_STREAM_API_TOKEN?: string;
  R2_PUBLIC_DOMAIN?: string;
  NEXT_PUBLIC_BASE_URL?: string;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(options?: { columnNames?: boolean }): Promise<T[]>;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
    size_after: number;
  };
}

interface D1ExecResult {
  count: number;
  duration: number;
}

interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    options?: R2PutOptions
  ): Promise<R2Object>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
  head(key: string): Promise<R2Object | null>;
}

interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    cacheExpiry?: Date;
  };
  customMetadata?: Record<string, string>;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: Record<string, string>;
  customMetadata?: Record<string, string>;
}

type R2ObjectBody = R2Object & {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
  blob(): Promise<Blob>;
};

interface R2ListOptions {
  prefix?: string;
  delimiter?: string;
  cursor?: string;
  include?: ('httpMetadata' | 'customMetadata')[];
  limit?: number;
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

/**
 * Get the D1 database binding from the Cloudflare environment.
 * 
 * In Next.js on Cloudflare Pages (via @cloudflare/next-on-pages),
 * bindings are available on `process.env` with the binding name,
 * or via `getCloudflareContext()`.
 * 
 * This helper tries multiple access patterns for compatibility.
 */
export function getDB(): D1Database | null {
  // Method 1: Via globalThis.__env__ (set by next-on-pages runtime)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env1 = (globalThis as any).__env__;
  if (env1?.DB) return env1.DB as D1Database;

  // Method 2: Via process.__cloudflareBindings (some adapter versions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env2 = (process as any).__cloudflareBindings;
  if (env2?.DB) return env2.DB as D1Database;

  // Method 3: Directly on process.env (won't work for D1, but fallback)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env3 = (process.env as any).DB;
  if (env3) return env3 as D1Database;

  return null;
}

export function getR2(): R2Bucket | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (globalThis as any).__env__;
  if (env?.R2_BUCKET) return env.R2_BUCKET as R2Bucket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env2 = (process as any).__cloudflareBindings;
  if (env2?.R2_BUCKET) return env2.R2_BUCKET as R2Bucket;
  return null;
}
