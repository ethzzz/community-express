'use client';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20">
      <div className="card p-8 text-center">
        <p className="eyebrow">Something broke</p>
        <h1 className="font-display mt-3 text-3xl font-semibold">页面暂时没接上</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {error.message || '请求失败，请稍后再试。'}
        </p>
        <button className="btn-primary mt-6" onClick={reset} type="button">
          重试
        </button>
      </div>
    </main>
  );
}
