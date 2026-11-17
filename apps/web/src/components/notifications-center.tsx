'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BellIcon, HeartIcon, MessageIcon, UsersIcon } from '@/components/icons';
import { bffFetch } from '@/lib/bff';
import { formatTime } from '@/lib/format';
import type { Notification } from '@/lib/types';

const meta = {
  like: {
    label: '有人赞了你的帖子',
    icon: HeartIcon,
    style: { background: 'var(--accent-soft)', color: 'var(--accent-dark)' },
  },
  comment: {
    label: '有人评论了你的帖子',
    icon: MessageIcon,
    style: { background: '#eef0e4', color: 'var(--olive)' },
  },
  follow: {
    label: '有人关注了你',
    icon: UsersIcon,
    style: { background: '#f7ecd4', color: '#95651d' },
  },
  system: {
    label: '系统通知',
    icon: BellIcon,
    style: { background: 'var(--surface-2)', color: 'var(--ink-soft)' },
  },
} as const;

function getMeta(type: string) {
  return meta[type as keyof typeof meta] ?? meta.system;
}

export function NotificationsCenter() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => bffFetch<{ items: Notification[] }>('/notifications'),
  });

  useEffect(() => {
    const source = new EventSource('/api/notifications/stream', { withCredentials: true });

    source.addEventListener('notification', (event) => {
      const notification = JSON.parse((event as MessageEvent).data) as Notification;
      queryClient.setQueryData<{ items: Notification[] }>(['notifications'], (old) => {
        const items = old?.items ?? [];
        if (items.some((item) => item.id === notification.id)) return old;
        return { items: [notification, ...items] };
      });
    });

    return () => source.close();
  }, [queryClient]);

  async function markRead() {
    await bffFetch('/notifications/read', { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">加载通知...</p>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <p className="text-sm font-semibold">最近动态</p>
        <button className="text-xs text-[var(--muted)] hover:text-[var(--ink)]" onClick={markRead} type="button">
          全部标为已读
        </button>
      </div>

      {!data?.items.length ? (
        <div className="px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">暂时没有新动静</p>
          <p className="mt-2 text-sm text-[var(--muted)]">去关注流里回一句，或者发一条帖子。</p>
        </div>
      ) : (
        <ul>
          {data.items.map((notification) => {
            const item = getMeta(notification.type);
            const Icon = item.icon;
            const unread = !notification.readAt;
            return (
              <li
                className="flex gap-4 border-b border-[var(--line)] px-5 py-4 last:border-b-0"
                key={notification.id}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={item.style}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.label}</p>
                    {unread && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
                  </div>
                  <time className="mt-1 block text-xs text-[var(--muted)]">
                    {formatTime(notification.createdAt)}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
