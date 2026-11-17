import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { ArrowUpRightIcon, MessageIcon } from '@/components/icons';
import { LikeButton } from '@/components/like-button';
import { formatTime } from '@/lib/format';
import type { Post } from '@/lib/types';

export function PostCard({ post, index }: { post: Post; index: number }) {
  const delay = `${Math.min(index, 8) * 45}ms`;

  return (
    <article
      className="card card-hover reveal group relative overflow-hidden p-5 sm:p-6"
      style={{ '--delay': delay } as CSSProperties}
    >
      <span className="font-display absolute right-5 top-5 text-xs font-semibold text-[var(--line-strong)]">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex items-center gap-3">
        <Avatar name={post.author?.nickname} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{post.author?.nickname ?? '匿名用户'}</p>
          <time className="text-xs text-[var(--muted)]">{formatTime(post.createdAt)}</time>
        </div>
      </div>

      <Link className="mt-4 block" href={`/posts/${post.id}`}>
        {post.title && (
          <h2 className="font-display text-[1.35rem] font-semibold leading-snug transition-colors group-hover:text-[var(--accent-dark)]">
            {post.title}
          </h2>
        )}
        <p className="clamp-3 mt-2 text-sm leading-7 text-[var(--ink-soft)]">{post.content}</p>
      </Link>

      <div className="mt-5 flex items-center gap-2 border-t border-[var(--line)] pt-4">
        <LikeButton initialCount={post.likeCount} postId={post.id} />
        <Link className="action-pill" href={`/posts/${post.id}#comments`}>
          <MessageIcon className="h-4 w-4" />
          {post.commentCount}
        </Link>
        <Link
          className="ml-auto flex items-center gap-1 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--accent-dark)]"
          href={`/posts/${post.id}`}
        >
          阅读全文
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
