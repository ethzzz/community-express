'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar } from '@/components/avatar';
import { bffFetch } from '@/lib/bff';
import { formatTime } from '@/lib/format';
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
    <section className="card mt-6 p-6 sm:p-8" id="comments">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">讨论</h2>
        <span className="chip">{data?.items.length ?? 0} 条</span>
      </div>

      {isLoading && <p className="mt-4 text-sm text-[var(--muted)]">加载讨论...</p>}
      {queryError && <p className="mt-4 text-sm text-red-600">讨论加载失败</p>}
      {data?.items.length === 0 && (
        <p className="mt-4 text-sm text-[var(--muted)]">还没有人说话，来开个头。</p>
      )}

      <ul className="mt-5 space-y-5">
        {data?.items.map((comment) => (
          <li className="flex gap-3" key={comment.id}>
            <Avatar name={comment.author?.nickname} size="sm" />
            <div className="min-w-0 flex-1 rounded-2xl bg-[var(--surface-2)] px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">{comment.author?.nickname ?? '匿名用户'}</p>
                <time className="text-[11px] text-[var(--muted)]">{formatTime(comment.createdAt)}</time>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[var(--ink-soft)]">
                {comment.content}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <form className="mt-6 flex gap-2 border-t border-[var(--line)] pt-5" onSubmit={submit}>
        <input
          className="field"
          onChange={(event) => setContent(event.target.value)}
          placeholder="说点具体的..."
          value={content}
        />
        <button className="btn-primary shrink-0" disabled={pending} type="submit">
          发送
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}
