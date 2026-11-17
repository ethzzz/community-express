export default function NotificationsLoading() {
  return (
    <main className="mx-auto max-w-3xl py-8 sm:py-10">
      <div className="mb-7 space-y-3 border-b border-[var(--line)] pb-7">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-12 w-40 rounded-2xl" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <div className="skeleton h-20" key={item} />
        ))}
      </div>
    </main>
  );
}
