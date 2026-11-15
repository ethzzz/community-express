import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  API_BASE,
  cookieOptions,
  getRefreshToken,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from '@/lib/backend';

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const upstream = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await upstream.json()) as {
    accessToken?: string;
    user?: { id: string; email: string; nickname: string };
    message?: string;
  };

  if (!upstream.ok || !data.accessToken) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(ACCESS_COOKIE, data.accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_MAX_AGE,
  });

  const refreshToken = getRefreshToken(upstream.headers);
  if (refreshToken) {
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_MAX_AGE,
    });
  }

  return response;
}
