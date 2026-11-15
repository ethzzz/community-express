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
    <main className="mx-auto max-w-sm px-4 py-20">
      <form className="space-y-3 rounded-xl border bg-white p-6 shadow-sm" method="post" onSubmit={submit}>
        <h1 className="text-2xl font-bold">登录</h1>
        <input
          autoComplete="email"
          className="w-full rounded border p-2"
          name="email"
          placeholder="邮箱"
          required
          type="email"
        />
        <input
          autoComplete="current-password"
          className="w-full rounded border p-2"
          name="password"
          placeholder="密码"
          required
          type="password"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? '登录中...' : '登录'}
        </button>
        <p className="text-center text-sm text-slate-500">
          还没有账号？{' '}
          <Link className="text-slate-900 underline" href="/register">
            注册
          </Link>
        </p>
      </form>
    </main>
  );
}
