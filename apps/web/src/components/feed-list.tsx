'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PostCard } from '@/components/post-card';
import { bffFetch } from '@/lib/bff';
import type { Post } from '@/lib/types';

type FeedResponse = {
  items: Post[];
  nextCursor: string | null;
};

export function FeedList({
  initialItems,
  initialCursor,
}: {
  initialItems: Post[];
  initialCursor: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await bffFetch<FeedResponse>(
        `/feed?limit=20&cursor=${encodeURIComponent(cursor)}`,
      );
      setItems((current) => [...current, ...data.items]);
      setCursor(data.nextCursor);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        action={{ href: '/posts/new', label: '发出第一条帖子' }}
        description="关注更多人，或者先写下你正在做的事。围炉的第一把火，可以从你开始。"
        title="这里还很安静"
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs text-[var(--muted)]">共 {items.length} 篇</p>
        <span className="chip">按时间排序</span>
      </div>

      <div className="space-y-4">
        {items.map((post, index) => (
          <PostCard index={index} key={post.id} post={post} />
        ))}
      </div>

      <div className="mt-6 text-center">
        {cursor ? (
          <button className="btn-ghost" disabled={loading} onClick={loadMore} type="button">
            {loading ? '正在添柴...' : '再看看更早的帖子'}
          </button>
        ) : (
          <p className="text-xs tracking-widest text-[var(--muted)]">已经到底了</p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
