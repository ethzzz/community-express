import { NotificationsCenter } from '@/components/notifications-center';

export default function NotificationsPage() {
  return (
    <main className="mx-auto max-w-3xl py-8 sm:py-10">
      <section className="mb-7 border-b border-[var(--line)] pb-7">
        <p className="eyebrow">Inbox</p>
        <h1 className="font-display mt-2 text-4xl font-semibold">通知</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          点赞、评论和关注会实时出现在这里。
        </p>
      </section>
      <NotificationsCenter />
    </main>
  );
}
