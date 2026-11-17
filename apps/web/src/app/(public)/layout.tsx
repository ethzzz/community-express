import Link from 'next/link';
import { cookies } from 'next/headers';
import { SiteHeader } from '@/components/site-header';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/backend';
import { decodeJwt } from '@/lib/jwt';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const loggedIn = Boolean(store.get(REFRESH_COOKIE)?.value);
  const isAdmin = decodeJwt(store.get(ACCESS_COOKIE)?.value)?.roles?.includes('admin') ?? false;

  return (
    <div className="paper-shell min-h-screen">
      <SiteHeader isAdmin={isAdmin} loggedIn={loggedIn} />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
      <footer className="mx-auto mt-16 w-full max-w-6xl px-4 pb-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--line)] pt-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center">
          <p>围炉 · 一个用来把问题摊开聊的地方</p>
          <p>
            Built with Express + Next.js ·{' '}
            <Link className="underline decoration-[var(--line-strong)] underline-offset-4" href="/feed">
              回到关注流
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
