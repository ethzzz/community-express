import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="paper-shell flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-10 text-center">
        <p className="eyebrow">404</p>
        <h1 className="font-display mt-3 text-4xl font-semibold">这页不在围炉里</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          链接可能过期了，或者帖子已经被删除。
        </p>
        <Link className="btn-primary mt-6" href="/feed">
          回到关注流
        </Link>
      </div>
    </main>
  );
}
