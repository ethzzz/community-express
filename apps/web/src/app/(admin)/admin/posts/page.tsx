import { AdminActionButton } from '@/components/admin/admin-action-button';
import { StatusBadge } from '@/components/admin/status-badge';
import { adminJson } from '@/lib/admin-server';
import type { AdminPost } from '@/lib/admin-types';
import { formatTime } from '@/lib/format';

export default async function AdminPostsPage() {
  const data = await adminJson<{ items: AdminPost[] }>('/posts?status=pending');

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Moderation</p>
          <h1 className="font-display mt-2 text-3xl font-semibold">帖子审核</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">通过后才会进入关注流。</p>
        </div>
        <span className="chip">{data.items.length} 篇待审核</span>
      </header>

      <section className="card overflow-hidden">
        {data.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl font-semibold">审核队列是空的</p>
            <p className="mt-2 text-sm text-[var(--muted)]">新的 pending 帖子会出现在这里。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>帖子</th>
                  <th>作者</th>
                  <th>时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((post) => (
                  <tr key={post.id}>
                    <td className="max-w-md">
                      <p className="font-semibold">{post.title ?? '无标题'}</p>
                      <p className="clamp-3 mt-1 text-xs leading-5 text-[var(--muted)]">
                        {post.content}
                      </p>
                    </td>
                    <td>
                      <p className="font-medium">{post.author.nickname}</p>
                      <p className="text-xs text-[var(--muted)]">{post.author.email}</p>
                    </td>
                    <td className="whitespace-nowrap text-[var(--muted)]">
                      {formatTime(post.createdAt)}
                    </td>
                    <td>
                      <StatusBadge status={post.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton
                          label="通过"
                          path={`/posts/${post.id}/approve`}
                          tone="primary"
                        />
                        <AdminActionButton
                          label="拒绝"
                          path={`/posts/${post.id}/reject`}
                          promptReason
                          tone="danger"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
