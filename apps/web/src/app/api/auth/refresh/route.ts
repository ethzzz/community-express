import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  API_BASE,
  cookieOptions,
  getRefreshToken,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from '@/lib/backend';

function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/feed';
}

async function refresh(request: NextRequest) {
  const token = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!token) return { response: null, cookies: null };

  const upstream = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { cookie: `${REFRESH_COOKIE}=${token}` },
  });
  if (!upstream.ok) return { response: upstream, cookies: null };

  const data = (await upstream.json()) as { accessToken: string };
  return {
    response: upstream,
    cookies: {
      accessToken: data.accessToken,
      refreshToken: getRefreshToken(upstream.headers),
    },
  };
}

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get('next'));
  const result = await refresh(request);

  if (!result.cookies) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set(ACCESS_COOKIE, '', { ...cookieOptions, maxAge: 0 });
    response.cookies.set(REFRESH_COOKIE, '', { ...cookieOptions, maxAge: 0 });
    return response;
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(ACCESS_COOKIE, result.cookies.accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_MAX_AGE,
  });
  if (result.cookies.refreshToken) {
    response.cookies.set(REFRESH_COOKIE, result.cookies.refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_MAX_AGE,
    });
  }
  return response;
}

export async function POST(request: NextRequest) {
  const result = await refresh(request);
  if (!result.cookies) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, result.cookies.accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_MAX_AGE,
  });
  if (result.cookies.refreshToken) {
    response.cookies.set(REFRESH_COOKIE, result.cookies.refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_MAX_AGE,
    });
  }
  return response;
}
