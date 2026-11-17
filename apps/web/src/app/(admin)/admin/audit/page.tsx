import { adminJson } from '@/lib/admin-server';
import { actionLabel } from '@/lib/admin-format';
import type { AuditLog } from '@/lib/admin-types';
import { formatTime } from '@/lib/format';

export default async function AdminAuditPage() {
  const data = await adminJson<{ items: AuditLog[] }>('/audit-logs?limit=100');

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Audit</p>
          <h1 className="font-display mt-2 text-3xl font-semibold">审计日志</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">只读记录，不提供编辑和删除入口。</p>
        </div>
        <span className="chip">{data.items.length} 条记录</span>
      </header>

      <section className="card overflow-hidden">
        {data.items.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[var(--muted)]">还没有审计记录。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>动作</th>
                  <th>对象</th>
                  <th>操作人</th>
                  <th>原因</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id}>
                    <td className="font-semibold">{actionLabel(log.action)}</td>
                    <td>
                      {log.targetType} #{log.targetId}
                    </td>
                    <td>#{log.operatorId}</td>
                    <td className="text-[var(--ink-soft)]">{log.reason ?? '—'}</td>
                    <td className="whitespace-nowrap text-[var(--muted)]">
                      {formatTime(log.createdAt)}
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
