import { NextRequest, NextResponse } from 'next/server';
import { callBackendWithAuth } from '@/lib/server-api';

type Context = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const headers: Record<string, string> = {};
  const contentType = request.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  const init: RequestInit = { method: request.method, headers };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.text();
    if (body) init.body = body;
  }

  const target = `/api/v1/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  const { response: upstream, cookiesToSet } = await callBackendWithAuth(target, init);
  const text = await upstream.text();
  const response = new NextResponse(text || null, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });

  for (const cookie of cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}

export async function GET(request: NextRequest, context: Context) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: Context) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: Context) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: Context) {
  return proxy(request, context);
}
