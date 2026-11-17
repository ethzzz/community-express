'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-8 text-center">
        <p className="eyebrow">Admin error</p>
        <h1 className="font-display mt-3 text-3xl font-semibold">管理操作没有完成</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {error.message || '管理接口暂时不可用。'}
        </p>
        <button className="btn-primary mt-6" onClick={reset} type="button">
          再试一次
        </button>
      </div>
    </div>
  );
}
