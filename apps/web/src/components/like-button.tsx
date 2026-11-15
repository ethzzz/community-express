'use client';

import { useState } from 'react';
import { bffFetch } from '@/lib/bff';

type Props = {
  postId: string;
  initialCount: number;
  initialLiked?: boolean;
};

export function LikeButton({ postId, initialCount, initialLiked = false }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;

    const next = !liked;
    setLiked(next);
    setCount((value) => value + (next ? 1 : -1));
    setPending(true);

    try {
      await bffFetch(`/posts/${postId}/like`, { method: next ? 'POST' : 'DELETE' });
    } catch {
      setLiked(!next);
      setCount((value) => value + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className="rounded border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
      disabled={pending}
      onClick={toggle}
      type="button"
    >
      {liked ? '♥' : '♡'} {count}
    </button>
  );
}
