import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE, API_BASE } from '@/lib/backend';

type Post = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  author?: { nickname?: string; avatarUrl?: string | null };
};

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

      {data.items.length === 0 ? (
        <p className="rounded border bg-white p-6 text-sm text-slate-500">
          还没有内容，去关注几个人或发第一条帖子。
        </p>
      ) : (
        <ul className="space-y-4">
          {data.items.map((post) => (
            <li key={post.id}>
              <Link
                className="block rounded-xl border bg-white p-5 shadow-sm transition hover:border-slate-400"
                href={`/posts/${post.id}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{post.author?.nickname ?? '匿名用户'}</p>
                  <time className="text-xs text-slate-400">
                    {new Date(post.createdAt).toLocaleString('zh-CN')}
                  </time>
                </div>
                {post.title && <h2 className="mt-3 text-lg font-semibold">{post.title}</h2>}
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{post.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
