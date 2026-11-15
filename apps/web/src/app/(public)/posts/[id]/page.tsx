import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommentSection } from '@/components/comment-section';
import { FollowButton } from '@/components/follow-button';
import { LikeButton } from '@/components/like-button';
import { API_BASE } from '@/lib/backend';
import type { Post } from '@/lib/types';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${API_BASE}/api/v1/posts/${id}`, { cache: 'no-store' });

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(`post request failed: ${response.status}`);

  const post = (await response.json()) as Post;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link className="text-sm text-slate-500 hover:text-slate-900" href="/feed">
        ← 返回关注流
      </Link>
      <article className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{post.title ?? '无标题'}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {post.author?.nickname ?? '匿名用户'} ·{' '}
          {new Date(post.createdAt).toLocaleString('zh-CN')}
        </p>
        <p className="mt-6 whitespace-pre-wrap leading-7 text-slate-800">{post.content}</p>
        <div className="mt-6 flex items-center gap-3">
          <LikeButton initialCount={post.likeCount} postId={post.id} />
          {post.author?.id && <FollowButton userId={post.author.id} />}
          <span className="text-sm text-slate-500">评论 {post.commentCount}</span>
        </div>
      </article>
      <CommentSection postId={post.id} />
    </main>
  );
}
