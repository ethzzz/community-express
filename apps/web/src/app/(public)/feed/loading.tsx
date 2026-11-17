export default function FeedLoading() {
  return (
    <main className="py-8 sm:py-10">
      <div className="mb-8 space-y-3 border-b border-[var(--line)] pb-8">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-12 w-52 rounded-2xl" />
        <div className="skeleton h-4 w-80 max-w-full rounded-full" />
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div className="skeleton h-52" key={item} />
          ))}
        </div>
        <div className="skeleton h-80" />
      </div>
    </main>
  );
}
