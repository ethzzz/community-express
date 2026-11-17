'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FlameIcon, PenIcon } from '@/components/icons';

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');

    const response = await fetch('/api/posts', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || undefined, content }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };

    if (response.status === 401) {
      router.push('/login');
      return;
    }
    if (!response.ok) {
      setError(data.message ?? '发布失败');
      setPending(false);
      return;
    }

    router.push('/feed');
    router.refresh();
  }

  return (
    <main className="py-8 sm:py-10">
      <Link
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        href="/feed"
      >
        ← 返回关注流
      </Link>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <form className="card overflow-hidden" onSubmit={submit}>
          <div className="h-1.5 bg-[var(--accent)]" />
          <div className="p-6 sm:p-8">
            <p className="eyebrow">New post</p>
            <h1 className="font-display mt-2 text-3xl font-semibold">写点什么</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              把背景、卡点和下一步写清楚，比一句结论更有用。
            </p>

            <label className="mt-7 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              标题
            </label>
            <input
              className="font-display mt-2 w-full border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-2xl font-semibold outline-none placeholder:text-[var(--line-strong)] focus:border-[var(--accent)]"
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="一句话说清你要聊什么（可选）"
              value={title}
            />

            <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              正文
            </label>
            <textarea
              className="mt-2 w-full resize-y border-0 bg-transparent px-0 py-3 text-[0.98rem] leading-8 outline-none placeholder:text-[var(--line-strong)]"
              onChange={(event) => setContent(event.target.value)}
              placeholder="发生了什么？你试过什么？现在卡在哪里？"
              required
              rows={14}
              value={content}
            />

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
              <p className="text-xs text-[var(--muted)]">
                {content.length} 字 · 发布后进入待审核，通过后才会出现在关注流
              </p>
              <button className="btn-primary" disabled={pending} type="submit">
                <PenIcon className="h-4 w-4" />
                {pending ? '发布中...' : '发布'}
              </button>
            </div>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <FlameIcon className="h-4 w-4 text-[var(--accent)]" />
              <p className="eyebrow">写之前</p>
            </div>
            <ul className="mt-3 space-y-2.5 text-sm leading-6 text-[var(--ink-soft)]">
              <li>先给背景，再给结论。</li>
              <li>贴出可复现的命令或报错。</li>
              <li>如果求助，写清你已经排除了什么。</li>
            </ul>
          </section>
          <section className="card p-5">
            <p className="eyebrow">审核说明</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              新帖默认是 pending。管理员审核通过后，关注你的人才能在 feed 里看到。
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
