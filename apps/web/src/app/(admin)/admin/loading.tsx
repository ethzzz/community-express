export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 space-y-3 border-b border-[var(--line)] pb-6">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-12 w-56 rounded-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div className="skeleton h-32" key={item} />
        ))}
      </div>
      <div className="skeleton mt-6 h-80" />
    </div>
  );
}
