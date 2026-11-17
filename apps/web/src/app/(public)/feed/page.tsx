import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FeedList } from '@/components/feed-list';
import { FeedSidebar } from '@/components/feed-sidebar';
import { PenIcon } from '@/components/icons';
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
  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <main className="py-8 sm:py-10">
      <section className="mb-8 flex flex-col justify-between gap-6 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Following</p>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">关注流</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--ink-soft)]">
            你关注的人正在做什么。慢一点读，认真回一句。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip">{today}</span>
          <Link className="btn-primary" href="/posts/new">
            <PenIcon className="h-4 w-4" />
            写点什么
          </Link>
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <FeedList initialCursor={data.nextCursor} initialItems={data.items} />
        <FeedSidebar posts={data.items} />
      </div>
    </main>
  );
}
