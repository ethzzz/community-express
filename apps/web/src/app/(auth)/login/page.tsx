'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };

    if (!response.ok) {
      setError(data.message ?? '登录失败');
      setPending(false);
      return;
    }

    router.push('/feed');
    router.refresh();
  }

  return (
    <div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="font-display mt-2 text-4xl font-semibold">回来坐坐</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">你的关注流还在原来的位置。</p>

      <form className="card mt-7 space-y-5 p-6 sm:p-8" method="post" onSubmit={submit}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            邮箱
          </span>
          <input
            autoComplete="email"
            className="field"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            密码
          </span>
          <input
            autoComplete="current-password"
            className="field"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn-primary w-full" disabled={pending} type="submit">
          {pending ? '登录中...' : '登录'}
        </button>

        <p className="text-center text-sm text-[var(--muted)]">
          还没有账号？{' '}
          <Link className="font-semibold text-[var(--accent-dark)]" href="/register">
            加入围炉
          </Link>
        </p>
      </form>
    </div>
  );
}
