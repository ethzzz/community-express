'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Tone = 'primary' | 'ghost' | 'danger';

export function AdminActionButton({
  path,
  label,
  body,
  tone = 'ghost',
  confirm,
  promptReason = false,
}: {
  path: string;
  label: string;
  body?: Record<string, unknown>;
  tone?: Tone;
  confirm?: string;
  promptReason?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    if (confirm && !window.confirm(confirm)) return;

    let payload = body;
    if (promptReason) {
      const reason = window.prompt('填写处理原因（可取消）');
      if (reason === null) return;
      payload = { ...body, reason };
    }

    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/admin${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message ?? `HTTP ${response.status}`);
      }
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : '操作失败');
    } finally {
      setPending(false);
    }
  }

  const className =
    tone === 'primary' ? 'btn-primary px-3 py-1.5 text-xs' : tone === 'danger' ? 'admin-danger px-3 py-1.5' : 'btn-ghost px-3 py-1.5 text-xs';

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button className={className} disabled={pending} onClick={run} type="button">
        {pending ? '处理中...' : label}
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </span>
  );
}
