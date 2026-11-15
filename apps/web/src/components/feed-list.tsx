'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LikeButton } from '@/components/like-button';
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
      <p className="rounded border bg-white p-6 text-sm text-slate-500">
        还没有内容，去关注几个人或发第一条帖子。
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-4">
        {items.map((post) => (
          <li key={post.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{post.author?.nickname ?? '匿名用户'}</p>
              <time className="text-xs text-slate-400">
                {new Date(post.createdAt).toLocaleString('zh-CN')}
              </time>
            </div>
            <Link className="mt-3 block" href={`/posts/${post.id}`}>
              {post.title && <h2 className="text-lg font-semibold">{post.title}</h2>}
              <p className="mt-2 whitespace-pre-wrap text-slate-700">{post.content}</p>
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <LikeButton initialCount={post.likeCount} postId={post.id} />
              <Link className="text-sm text-slate-500" href={`/posts/${post.id}`}>
                评论 {post.commentCount}
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 text-center">
        {cursor ? (
          <button
            className="rounded border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            disabled={loading}
            onClick={loadMore}
            type="button"
          >
            {loading ? '加载中...' : '加载更多'}
          </button>
        ) : (
          <p className="text-sm text-slate-400">已经到底了</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
