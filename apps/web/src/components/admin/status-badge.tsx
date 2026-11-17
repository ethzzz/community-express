const styles: Record<string, string> = {
  pending: 'badge-pending',
  published: 'badge-ok',
  resolved: 'badge-ok',
  active: 'badge-ok',
  rejected: 'badge-danger',
  banned: 'badge-danger',
  deleted: 'badge-muted',
};

const labels: Record<string, string> = {
  pending: '待处理',
  published: '已发布',
  resolved: '已解决',
  active: '正常',
  rejected: '已拒绝',
  banned: '已封禁',
  deleted: '已删除',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${styles[status] ?? 'badge-muted'}`}>
      {labels[status] ?? status}
    </span>
  );
}
