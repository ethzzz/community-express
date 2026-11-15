import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FeedList } from '@/components/feed-list';
import { ACCESS_COOKIE, API_BASE } from '@/lib/backend';
import type { Post } from '@/lib/types';

type FeedResponse = {
  items: Post[];
  nextCursor: string | null;
};

export default async function FeedPage() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect('/login');

  const response = await fetch(`${API_BASE}/api/v1/feed?limit=20`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (response.status === 401) redirect('/api/auth/refresh?next=/feed');
  if (!response.ok) throw new Error(`feed request failed: ${response.status}`);

  const data = (await response.json()) as FeedResponse;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">关注流</h1>
          <p className="mt-1 text-sm text-slate-500">你关注的人发布的帖子</p>
        </div>
        <Link className="rounded bg-slate-900 px-4 py-2 text-sm text-white" href="/posts/new">
          发帖
        </Link>
      </div>
      <FeedList initialCursor={data.nextCursor} initialItems={data.items} />
    </main>
  );
}
