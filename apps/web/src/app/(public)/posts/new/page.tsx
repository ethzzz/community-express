'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link className="text-sm text-slate-500 hover:text-slate-900" href="/feed">
        ← 返回关注流
      </Link>
      <form className="mt-4 space-y-3 rounded-xl border bg-white p-6 shadow-sm" onSubmit={submit}>
        <h1 className="text-2xl font-bold">发帖</h1>
        <input
          className="w-full rounded border p-2"
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="标题（可选）"
          value={title}
        />
        <textarea
          className="w-full rounded border p-3"
          onChange={(event) => setContent(event.target.value)}
          placeholder="写点什么..."
          required
          rows={10}
          value={content}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-xs text-slate-500">新帖默认 pending，审核通过后才会进入关注流。</p>
        <button
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? '发布中...' : '发布'}
        </button>
      </form>
    </main>
  );
}
