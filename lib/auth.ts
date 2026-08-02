import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_THIS_IS_A_STRONG_SECRET'
);

export interface JWTPayload {
  sub: string;         // user id
  email: string;
  name: string;
  role: 'teacher' | 'admin';
  avatar_url?: string;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET_KEY);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Fast & secure Web Crypto password hashing for Cloudflare Edge Runtime
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'SALT_COURSES_APP_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const tokenCookie = cookies.find(c => c.startsWith('teacher_token='));
  return tokenCookie ? tokenCookie.split('=').slice(1).join('=') : null;
}

export function createSessionCookie(token: string): string {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  return `teacher_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`;
}

export function clearSessionCookie(): string {
  return 'teacher_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';
}
