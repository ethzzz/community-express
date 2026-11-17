'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/logout-button';
import { BellIcon, PenIcon } from '@/components/icons';

const links = [
  { href: '/feed', label: '关注流' },
  { href: '/notifications', label: '通知', icon: true },
  { href: '/admin', label: '管理', adminOnly: true },
];

export function SiteHeader({
  loggedIn,
  isAdmin = false,
}: {
  loggedIn: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const visibleLinks = links.filter((link) => !link.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(247,242,232,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-7">
          <Link className="flex items-center gap-3" href={loggedIn ? '/feed' : '/login'}>
            <span className="brand-stamp">炉</span>
            <span className="leading-none">
              <span className="font-display block text-[1.35rem] font-semibold">围炉</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.34em] text-[var(--muted)]">
                WEILU
              </span>
            </span>
          </Link>

          {loggedIn && (
            <nav className="hidden items-center gap-6 sm:flex">
              {visibleLinks.map((link) => (
                <Link
                  className="nav-link flex items-center gap-1.5"
                  data-active={pathname.startsWith(link.href)}
                  href={link.href}
                  key={link.href}
                >
                  {link.icon && <BellIcon className="h-3.5 w-3.5" />}
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <Link
                aria-label="通知"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] sm:hidden"
                href="/notifications"
              >
                <BellIcon className="h-4 w-4" />
              </Link>
              <span className="hidden sm:inline-flex">
                <Link className="btn-primary" href="/posts/new">
                  <PenIcon className="h-4 w-4" />
                  发帖
                </Link>
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link className="text-sm text-[var(--muted)] hover:text-[var(--ink)]" href="/login">
                登录
              </Link>
              <Link className="btn-primary" href="/register">
                加入围炉
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
