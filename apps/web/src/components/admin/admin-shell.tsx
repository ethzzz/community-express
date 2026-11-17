'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/logout-button';
import {
  ClipboardIcon,
  FlagIcon,
  GridIcon,
  ShieldIcon,
  UsersIcon,
} from '@/components/icons';

const links = [
  { href: '/admin', label: '看板', icon: GridIcon, exact: true },
  { href: '/admin/posts', label: '帖子审核', icon: ShieldIcon },
  { href: '/admin/reports', label: '举报处理', icon: FlagIcon },
  { href: '/admin/users', label: '用户管理', icon: UsersIcon },
  { href: '/admin/audit', label: '审计日志', icon: ClipboardIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const renderNav = (mobile = false) => (
    <nav className={mobile ? 'flex gap-1' : 'space-y-1'}>
      {links.map((link) => {
        const Icon = link.icon;
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            className={`admin-nav-link${mobile ? ' admin-nav-link-mobile' : ''}`}
            data-active={active}
            href={link.href}
            key={link.href}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="paper-shell min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="admin-sidebar hidden flex-col p-5 lg:flex">
        <Link className="flex items-center gap-3 px-2" href="/admin">
          <span className="brand-stamp">炉</span>
          <span>
            <span className="font-display block text-xl font-semibold text-white">围炉</span>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.3em] text-white/40">
              CONTROL ROOM
            </span>
          </span>
        </Link>

        <div className="mt-10">{renderNav()}</div>

        <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
          <Link className="admin-nav-link" href="/feed">
            ← 返回社区
          </Link>
          <div className="px-1">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(247,242,232,0.86)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:py-4">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="brand-stamp">炉</span>
              <span className="font-display text-lg font-semibold">管理后台</span>
            </div>
            <div className="hidden lg:block">
              <p className="eyebrow">Control room</p>
              <p className="font-display mt-1 text-xl font-semibold">管理后台</p>
            </div>
            <div className="flex items-center gap-2">
              <Link className="btn-ghost px-3 py-1.5 text-xs" href="/feed">
                社区
              </Link>
              <div className="lg:hidden">
                <LogoutButton />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-3 lg:hidden">{renderNav(true)}</div>
        </header>

        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
