import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/backend';
import { isJwtExpired } from '@/lib/jwt';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = pathname === '/feed' || pathname === '/posts/new';
  if (!isProtected) return NextResponse.next();

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) return NextResponse.redirect(new URL('/login', request.url));

  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (isJwtExpired(access)) {
    const url = new URL('/api/auth/refresh', request.url);
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/feed/:path*', '/posts/new'],
};
