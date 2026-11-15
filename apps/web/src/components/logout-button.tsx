'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      className="rounded border px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
      disabled={pending}
      onClick={logout}
      type="button"
    >
      {pending ? '退出中...' : '退出'}
    </button>
  );
}
