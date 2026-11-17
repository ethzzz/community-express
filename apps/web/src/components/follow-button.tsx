'use client';

import { useState } from 'react';
import { UsersIcon } from '@/components/icons';
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
      aria-pressed={following}
      className="action-pill"
      data-active={following}
      disabled={pending}
      onClick={toggle}
      type="button"
    >
      <UsersIcon className="h-4 w-4" />
      {following ? '已关注' : '关注'}
    </button>
  );
}
