import { AdminActionButton } from '@/components/admin/admin-action-button';
import { StatusBadge } from '@/components/admin/status-badge';
import { adminJson } from '@/lib/admin-server';
import type { AdminUser } from '@/lib/admin-types';
import { formatTime } from '@/lib/format';

export default async function AdminUsersPage() {
  const data = await adminJson<{ items: AdminUser[] }>('/users');

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Users</p>
          <h1 className="font-display mt-2 text-3xl font-semibold">用户管理</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            封禁会立即吊销 refresh token，并要求重新登录。
          </p>
        </div>
        <span className="chip">{data.items.length} 个用户</span>
      </header>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>用户</th>
                <th>角色</th>
                <th>注册时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((user) => {
                const banned = user.status === 'banned';
                const isAdmin = user.roles.includes('admin');
                return (
                  <tr key={user.id}>
                    <td>
                      <p className="font-semibold">{user.nickname}</p>
                      <p className="text-xs text-[var(--muted)]">{user.email}</p>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span className="chip" key={role}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-[var(--muted)]">
                      {formatTime(user.createdAt)}
                    </td>
                    <td>
                      <StatusBadge status={user.status} />
                    </td>
                    <td>
                      {isAdmin ? (
                        <span className="text-xs text-[var(--muted)]">管理员账号</span>
                      ) : (
                        <AdminActionButton
                          confirm={banned ? '确认解封该用户？' : '确认封禁该用户？'}
                          label={banned ? '解封' : '封禁'}
                          path={`/users/${user.id}/${banned ? 'unban' : 'ban'}`}
                          tone={banned ? 'ghost' : 'danger'}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
