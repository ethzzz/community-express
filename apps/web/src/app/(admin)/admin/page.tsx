import Link from 'next/link';
import { actionLabel } from '@/lib/admin-format';
import { adminJson } from '@/lib/admin-server';
import { formatTime } from '@/lib/format';
import type { AdminStats, AuditLog } from '@/lib/admin-types';

const cards = [
  { key: 'pendingPosts', label: '待审核帖子', href: '/admin/posts', accent: 'text-[var(--accent-dark)]' },
  { key: 'pendingReports', label: '待处理举报', href: '/admin/reports', accent: 'text-[#8a5b12]' },
  { key: 'users', label: '注册用户', href: '/admin/users', accent: 'text-[var(--olive)]' },
  { key: 'publishedPosts', label: '已发布帖子', href: '/feed', accent: 'text-[var(--ink)]' },
] as const;

export default async function AdminDashboardPage() {
  const [stats, audit] = await Promise.all([
    adminJson<AdminStats>('/dashboard/stats'),
    adminJson<{ items: AuditLog[] }>('/audit-logs?limit=6'),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7 border-b border-[var(--line)] pb-6">
        <p className="eyebrow">Control room</p>
        <h1 className="font-display mt-2 text-4xl font-semibold">管理看板</h1>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          先把待处理项清掉，再去社区里看看大家的讨论。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link className="card card-hover p-5" href={card.href} key={card.key}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              {card.label}
            </p>
            <p className={`font-display mt-3 text-4xl font-semibold ${card.accent}`}>
              {stats[card.key]}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">查看 →</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <div>
              <p className="eyebrow">Audit</p>
              <h2 className="font-display mt-1 text-xl font-semibold">最近操作</h2>
            </div>
            <Link className="text-xs text-[var(--muted)] hover:text-[var(--ink)]" href="/admin/audit">
              全部日志
            </Link>
          </div>

          {audit.items.length === 0 ? (
            <p className="px-5 py-10 text-sm text-[var(--muted)]">还没有管理操作。</p>
          ) : (
            <ul>
              {audit.items.map((log) => (
                <li
                  className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 last:border-b-0"
                  key={log.id}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {actionLabel(log.action)} · {log.targetType} #{log.targetId}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      操作人 #{log.operatorId} · {formatTime(log.createdAt)}
                    </p>
                  </div>
                  <span className="badge badge-muted">#{log.id}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <section className="card p-5">
            <p className="eyebrow">Quick links</p>
            <div className="mt-3 space-y-2">
              <Link className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-3 py-2.5 text-sm" href="/admin/posts">
                审核待处理帖子 <span>{stats.pendingPosts}</span>
              </Link>
              <Link className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-3 py-2.5 text-sm" href="/admin/reports">
                处理举报 <span>{stats.pendingReports}</span>
              </Link>
              <Link className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-3 py-2.5 text-sm" href="/admin/users">
                管理用户 <span>{stats.users}</span>
              </Link>
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">系统状态</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">封禁用户</span>
              <span className="font-display text-2xl font-semibold">{stats.bannedUsers}</span>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              refresh token 会随封禁一起吊销。
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
