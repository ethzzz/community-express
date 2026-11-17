'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SearchIcon } from '@/components/icons';
import { formatTime } from '@/lib/format';

type Post = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  author?: { nickname?: string };
};

const suggestions = ['验收', 'SSE', '前端', 'Prisma'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q') ?? '';
    setQuery(initial);
    initialized.current = true;
  }, []);

  useEffect(() => {
    if (!initialized.current) return;

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError('');
      window.history.replaceState(null, '', '/search');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('搜索失败');
        const data = (await response.json()) as { items: Post[] };
        setResults(data.items);
        window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}`);
      } catch (searchError) {
        if ((searchError as Error).name !== 'AbortError') {
          setError('搜索失败，请稍后再试');
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <main className="mx-auto max-w-3xl py-8 sm:py-10">
      <section className="border-b border-[var(--line)] pb-7">
        <p className="eyebrow">Search</p>
        <h1 className="font-display mt-2 text-4xl font-semibold">搜索围炉</h1>
        <div className="relative mt-5">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            autoFocus
            className="field py-3 pl-12 text-base"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜标题或正文..."
            value={query}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted)]">试试：</span>
          {suggestions.map((item) => (
            <button
              className="chip hover:border-[var(--line-strong)]"
              key={item}
              onClick={() => setQuery(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        {loading && <p className="text-sm text-[var(--muted)]">搜索中...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && query && results.length === 0 && (
          <div className="card px-6 py-12 text-center">
            <p className="font-display text-2xl font-semibold">没有找到相关帖子</p>
            <p className="mt-2 text-sm text-[var(--muted)]">换个关键词，或者去关注流里发一条。</p>
          </div>
        )}
        {!query && !loading && (
          <div className="card px-6 py-12 text-center">
            <p className="font-display text-2xl font-semibold">从一个关键词开始</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              搜索会优先走后端搜索接口，未上线时降级到已发布帖子过滤。
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {results.map((post) => (
            <li key={post.id}>
              <Link className="card card-hover block p-5" href={`/posts/${post.id}`}>
                <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                  <span>{post.author?.nickname ?? '匿名用户'}</span>
                  <time>{formatTime(post.createdAt)}</time>
                </div>
                {post.title && (
                  <h2 className="font-display mt-2 text-xl font-semibold">
                    {post.title}
                  </h2>
                )}
                <p className="clamp-3 mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  {post.content}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
