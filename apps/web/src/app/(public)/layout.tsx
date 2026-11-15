import Link from 'next/link';
import { cookies } from 'next/headers';
import { LogoutButton } from '@/components/logout-button';
import { REFRESH_COOKIE } from '@/lib/backend';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const loggedIn = Boolean(store.get(REFRESH_COOKIE)?.value);

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link className="text-lg font-bold" href="/feed">
              社区
            </Link>
            <Link className="text-sm text-slate-600 hover:text-slate-900" href="/feed">
              关注流
            </Link>
            <Link className="text-sm text-slate-600 hover:text-slate-900" href="/posts/new">
              发帖
            </Link>
            {loggedIn && (
              <Link className="text-sm text-slate-600 hover:text-slate-900" href="/notifications">
                通知
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            {loggedIn ? (
              <LogoutButton />
            ) : (
              <>
                <Link className="text-slate-600 hover:text-slate-900" href="/login">
                  登录
                </Link>
                <Link className="text-slate-600 hover:text-slate-900" href="/register">
                  注册
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
