import Link from 'next/link';
import { FlameIcon } from '@/components/icons';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-dark)]">
        <FlameIcon className="h-6 w-6" />
      </span>
      <h2 className="font-display mt-5 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p>
      {action && (
        <Link className="btn-primary mt-6" href={action.href}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
