import { NotificationsCenter } from '@/components/notifications-center';

export default function NotificationsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">通知</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">点赞、评论和关注会实时出现在这里</p>
      <NotificationsCenter />
    </main>
  );
}
