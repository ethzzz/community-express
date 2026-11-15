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
    <main className="mx-auto max-w-sm px-4 py-20">
      <form className="space-y-3 rounded-xl border bg-white p-6 shadow-sm" method="post" onSubmit={submit}>
        <h1 className="text-2xl font-bold">注册</h1>
        <input
          autoComplete="nickname"
          className="w-full rounded border p-2"
          name="nickname"
          placeholder="昵称"
          required
        />
        <input
          autoComplete="email"
          className="w-full rounded border p-2"
          name="email"
          placeholder="邮箱"
          required
          type="email"
        />
        <input
          autoComplete="new-password"
          className="w-full rounded border p-2"
          minLength={8}
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
          {pending ? '注册中...' : '注册'}
        </button>
        <p className="text-center text-sm text-slate-500">
          已有账号？{' '}
          <Link className="text-slate-900 underline" href="/login">
            登录
          </Link>
        </p>
      </form>
    </main>
  );
}
