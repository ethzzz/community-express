'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { bffFetch } from '@/lib/bff';
import type { Notification } from '@/lib/types';

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

  if (isLoading) return <p className="text-sm text-slate-500">加载通知...</p>;

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button className="text-sm text-slate-500 hover:text-slate-900" onClick={markRead} type="button">
          全部已读
        </button>
      </div>
      {!data?.items.length ? (
        <p className="rounded border bg-white p-6 text-sm text-slate-500">还没有通知。</p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((notification) => (
            <li key={notification.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-700">
                <span className="font-medium">{notification.type}</span> ·{' '}
                {new Date(notification.createdAt).toLocaleString('zh-CN')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
