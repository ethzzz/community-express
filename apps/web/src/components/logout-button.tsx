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
      className="btn-ghost px-3 py-1.5 text-xs"
      disabled={pending}
      onClick={logout}
      type="button"
    >
      {pending ? '退出中...' : '退出'}
    </button>
  );
}
