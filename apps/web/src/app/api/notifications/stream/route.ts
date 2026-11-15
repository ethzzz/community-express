import { cookies } from 'next/headers';
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
import { isJwtExpired } from '@/lib/jwt';

type Tokens = { accessToken: string; refreshToken?: string };

async function refreshTokens(refreshToken: string): Promise<Tokens | null> {
  const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { cookie: `${REFRESH_COOKIE}=${refreshToken}` },
  });
  if (!response.ok) return null;

  const data = (await response.json()) as { accessToken: string };
  return { accessToken: data.accessToken, refreshToken: getRefreshToken(response.headers) };
}

async function openStream(accessToken: string) {
  return fetch(`${API_BASE}/api/v1/notifications/stream`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
}

export async function GET() {
  const store = await cookies();
  let accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  let nextTokens: Tokens | null = null;

  if (isJwtExpired(accessToken) && refreshToken) {
    nextTokens = await refreshTokens(refreshToken);
    accessToken = nextTokens?.accessToken;
  }

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let upstream = await openStream(accessToken);
  if (upstream.status === 401 && refreshToken) {
    nextTokens = await refreshTokens(refreshToken);
    if (nextTokens) {
      accessToken = nextTokens.accessToken;
      upstream = await openStream(accessToken);
    }
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse('Notification stream unavailable', { status: upstream.status });
  }

  const response = new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });

  if (nextTokens) {
    response.cookies.set(ACCESS_COOKIE, nextTokens.accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_MAX_AGE,
    });
    if (nextTokens.refreshToken) {
      response.cookies.set(REFRESH_COOKIE, nextTokens.refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_MAX_AGE,
      });
    }
  }

  return response;
}
