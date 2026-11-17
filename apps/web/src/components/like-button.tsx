'use client';

import { useState } from 'react';
import { HeartIcon } from '@/components/icons';
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
      aria-label={liked ? '取消点赞' : '点赞'}
      aria-pressed={liked}
      className="action-pill"
      data-active={liked}
      disabled={pending}
      onClick={toggle}
      type="button"
    >
      <HeartIcon className="h-4 w-4" filled={liked} />
      {count}
    </button>
  );
}
