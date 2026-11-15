import { NextResponse } from 'next/server';
import { callBackendWithAuth } from '@/lib/server-api';

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: string; content?: string };
  const { response: upstream, cookiesToSet } = await callBackendWithAuth('/api/v1/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await upstream.json().catch(() => null);

  const response = NextResponse.json(data, { status: upstream.status });
  for (const cookie of cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
