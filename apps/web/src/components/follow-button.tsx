'use client';

import { useState } from 'react';
import { bffFetch } from '@/lib/bff';

export function FollowButton({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !following;
    setFollowing(next);
    setPending(true);
    try {
      await bffFetch(`/users/${userId}/follow`, { method: next ? 'POST' : 'DELETE' });
    } catch {
      setFollowing(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className="rounded border px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
      disabled={pending}
      onClick={toggle}
      type="button"
    >
      {following ? '已关注' : '关注'}
    </button>
  );
}
