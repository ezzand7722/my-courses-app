export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export const config = {
  matcher: [
    '/teacher/dashboard',
    '/teacher/courses/:path*',
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect teacher routes (excluding login/register)
  const protectedPaths = ['/teacher/dashboard', '/teacher/courses'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookies(cookieHeader);

  if (!token) {
    return NextResponse.redirect(new URL('/teacher/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload || (payload.role !== 'teacher' && payload.role !== 'admin')) {
    return NextResponse.redirect(new URL('/teacher/login', request.url));
  }

  return NextResponse.next();
}
