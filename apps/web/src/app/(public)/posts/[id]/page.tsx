import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar } from '@/components/avatar';
import { CommentSection } from '@/components/comment-section';
import { FollowButton } from '@/components/follow-button';
import { MessageIcon } from '@/components/icons';
import { LikeButton } from '@/components/like-button';
import { API_BASE } from '@/lib/backend';
import { formatTime } from '@/lib/format';
import type { Post } from '@/lib/types';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${API_BASE}/api/v1/posts/${id}`, { cache: 'no-store' });

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(`post request failed: ${response.status}`);

  const post = (await response.json()) as Post;

  return (
    <main className="mx-auto max-w-3xl py-8 sm:py-10">
      <Link
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        href="/feed"
      >
        ← 返回关注流
      </Link>

      <article className="card mt-4 overflow-hidden">
        <div className="h-1.5 bg-[var(--accent)]" />
        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <Avatar name={post.author?.nickname} size="lg" />
            <div>
              <p className="font-semibold">{post.author?.nickname ?? '匿名用户'}</p>
              <time className="text-xs text-[var(--muted)]">{formatTime(post.createdAt, true)}</time>
            </div>
            {post.author?.id && (
              <div className="ml-auto">
                <FollowButton userId={post.author.id} />
              </div>
            )}
          </div>

          <h1 className="font-display mt-7 text-3xl font-semibold leading-tight sm:text-4xl">
            {post.title ?? '无标题'}
          </h1>

          <div className="article-body mt-6">{post.content}</div>

          <div className="mt-8 flex items-center gap-2 border-t border-[var(--line)] pt-5">
            <LikeButton initialCount={post.likeCount} postId={post.id} />
            <a className="action-pill" href="#comments">
              <MessageIcon className="h-4 w-4" />
              {post.commentCount}
            </a>
            <span className="ml-auto text-xs text-[var(--muted)]">
              发布于围炉 · 慢慢聊
            </span>
          </div>
        </div>
      </article>

      <CommentSection postId={post.id} />
    </main>
  );
}
