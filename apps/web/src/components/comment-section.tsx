'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { bffFetch } from '@/lib/bff';
import type { Comment } from '@/lib/types';

export function CommentSection({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => bffFetch<{ items: Comment[] }>(`/posts/${postId}/comments?limit=50`),
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    setPending(true);
    setError('');
    try {
      await bffFetch(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setContent('');
      await queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '评论失败');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">评论</h2>
      {isLoading && <p className="mt-3 text-sm text-slate-500">加载评论...</p>}
      {queryError && <p className="mt-3 text-sm text-red-500">评论加载失败</p>}
      {data?.items.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">还没有评论，来抢沙发。</p>
      )}
      <ul className="mt-3 space-y-3">
        {data?.items.map((comment) => (
          <li key={comment.id} className="rounded border p-3">
            <p className="text-sm font-medium">{comment.author?.nickname ?? '匿名用户'}</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">{comment.content}</p>
          </li>
        ))}
      </ul>

      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <input
          className="flex-1 rounded border p-2"
          onChange={(event) => setContent(event.target.value)}
          placeholder="写评论..."
          value={content}
        />
        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          发送
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </section>
  );
}
