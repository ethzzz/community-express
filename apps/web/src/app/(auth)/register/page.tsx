'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: form.get('nickname'),
        email: form.get('email'),
        password: form.get('password'),
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };

    if (!response.ok) {
      setError(data.message ?? '注册失败，邮箱可能已被使用');
      setPending(false);
      return;
    }

    router.push('/login');
  }

  return (
    <div>
      <p className="eyebrow">Join the table</p>
      <h1 className="font-display mt-2 text-4xl font-semibold">找把椅子坐下</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">先介绍一下自己，再开始聊。</p>

      <form className="card mt-7 space-y-5 p-6 sm:p-8" method="post" onSubmit={submit}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            昵称
          </span>
          <input
            autoComplete="nickname"
            className="field"
            name="nickname"
            placeholder="别人怎么称呼你"
            required
          />
        </label>

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
            autoComplete="new-password"
            className="field"
            minLength={8}
            name="password"
            placeholder="至少 8 位"
            required
            type="password"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn-primary w-full" disabled={pending} type="submit">
          {pending ? '创建中...' : '创建账号'}
        </button>

        <p className="text-center text-sm text-[var(--muted)]">
          已经有账号？{' '}
          <Link className="font-semibold text-[var(--accent-dark)]" href="/login">
            直接登录
          </Link>
        </p>
      </form>
    </div>
  );
}
