import { NextRequest, NextResponse } from 'next/server';
import { API_BASE } from '@/lib/backend';

type Post = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  author?: { nickname?: string };
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!query) return NextResponse.json({ items: [] });

  const direct = await fetch(
    `${API_BASE}/api/v1/search/posts?q=${encodeURIComponent(query)}&limit=20`,
    { cache: 'no-store' },
  ).catch(() => null);

  if (direct?.ok) {
    return NextResponse.json(await direct.json());
  }

  const postsResponse = await fetch(`${API_BASE}/api/v1/posts`, { cache: 'no-store' });
  if (!postsResponse.ok) {
    return NextResponse.json({ code: 'SEARCH_UNAVAILABLE' }, { status: 502 });
  }

  const data = (await postsResponse.json()) as { items: Post[] };
  const needle = query.toLowerCase();
  const items = data.items
    .filter((post) =>
      `${post.title ?? ''}\n${post.content}`.toLowerCase().includes(needle),
    )
    .slice(0, 20);

  return NextResponse.json({ items });
}
