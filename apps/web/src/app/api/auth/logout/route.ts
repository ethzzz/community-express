import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, API_BASE, cookieOptions, REFRESH_COOKIE } from '@/lib/backend';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(REFRESH_COOKIE)?.value;
  if (token) {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { cookie: `${REFRESH_COOKIE}=${token}` },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return response;
}
