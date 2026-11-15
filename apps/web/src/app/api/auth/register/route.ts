import { NextResponse } from 'next/server';
import { API_BASE } from '@/lib/backend';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    nickname?: string;
  };
  const upstream = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
