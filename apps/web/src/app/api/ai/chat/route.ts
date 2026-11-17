import { NextResponse } from 'next/server';
import { callBackendWithAuth } from '@/lib/server-api';

export async function POST(request: Request) {
  const body = await request.text();
  const { response: upstream, cookiesToSet } = await callBackendWithAuth('/api/v1/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!upstream.ok || !upstream.body) {
    const message = await upstream.text().catch(() => 'AI unavailable');
    return NextResponse.json(
      { code: 'AI_UNAVAILABLE', message },
      { status: upstream.status || 502 },
    );
  }

  const response = new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });

  for (const cookie of cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
