import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { FlameIcon, UsersIcon } from '@/components/icons';
import type { Post } from '@/lib/types';

export function FeedSidebar({ posts }: { posts: Post[] }) {
  const authors = new Set(posts.map((post) => post.author?.nickname).filter(Boolean)).size;
  const likes = posts.reduce((total, post) => total + post.likeCount, 0);
  const hot = [...posts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3);

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      <section className="card p-5">
        <p className="eyebrow">About</p>
        <h2 className="font-display mt-2 text-2xl font-semibold">围炉</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          一个用来把问题摊开聊的地方。写下你正在做的事，也认真读别人的进度。
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-4 text-center">
          <div>
            <p className="font-display text-xl font-semibold">{posts.length}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--muted)]">帖子</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold">{authors}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--muted)]">作者</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold">{likes}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--muted)]">赞</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {['Express', 'Next.js', 'Prisma', 'Redis'].map((item) => (
            <span className="chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center gap-2">
          <FlameIcon className="h-4 w-4 text-[var(--accent)]" />
          <p className="eyebrow">今日热议</p>
        </div>
        {hot.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">还没有热门帖子。</p>
        ) : (
          <ol className="mt-3 space-y-4">
            {hot.map((post, index) => (
              <li className="flex gap-3" key={post.id}>
                <span className="font-display pt-0.5 text-lg font-semibold text-[var(--line-strong)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <Link
                    className="line-clamp-2 text-sm font-semibold leading-5 hover:text-[var(--accent-dark)]"
                    href={`/posts/${post.id}`}
                  >
                    {post.title ?? post.content.slice(0, 48)}
                  </Link>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Avatar name={post.author?.nickname} size="sm" />
                    <span>{post.author?.nickname ?? '匿名用户'}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card p-5">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-[var(--olive)]" />
          <p className="eyebrow">围炉公约</p>
        </div>
        <ul className="mt-3 space-y-2.5 text-sm leading-6 text-[var(--ink-soft)]">
          <li>先讲清背景，再问问题。</li>
          <li>对事不对人，允许不同结论。</li>
          <li>分享可复现的细节，而不是口号。</li>
        </ul>
      </section>
    </aside>
  );
}
