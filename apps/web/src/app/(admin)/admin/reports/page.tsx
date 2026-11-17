import { AdminActionButton } from '@/components/admin/admin-action-button';
import { StatusBadge } from '@/components/admin/status-badge';
import { adminJson } from '@/lib/admin-server';
import type { AdminReport } from '@/lib/admin-types';
import { formatTime } from '@/lib/format';

export default async function AdminReportsPage() {
  const data = await adminJson<{ items: AdminReport[] }>('/reports?status=pending');

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Reports</p>
          <h1 className="font-display mt-2 text-3xl font-semibold">举报处理</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">处理动作会写入审计日志。</p>
        </div>
        <span className="chip">{data.items.length} 条待处理</span>
      </header>

      <section className="card overflow-hidden">
        {data.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl font-semibold">没有待处理举报</p>
            <p className="mt-2 text-sm text-[var(--muted)]">社区目前还算安静。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>目标</th>
                  <th>原因</th>
                  <th>时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <p className="font-semibold">
                        {report.targetType} #{report.targetId}
                      </p>
                    </td>
                    <td className="max-w-md text-[var(--ink-soft)]">{report.reason}</td>
                    <td className="whitespace-nowrap text-[var(--muted)]">
                      {formatTime(report.createdAt)}
                    </td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <AdminActionButton
                          body={{ action: 'resolve' }}
                          label="通过"
                          path={`/reports/${report.id}/resolve`}
                          tone="primary"
                        />
                        <AdminActionButton
                          body={{ action: 'reject' }}
                          label="驳回"
                          path={`/reports/${report.id}/resolve`}
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
