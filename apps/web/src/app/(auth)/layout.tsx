import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-shell min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="auth-brand relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[var(--accent)]/20 blur-3xl" />

        <Link className="relative flex items-center gap-3" href="/login">
          <span className="brand-stamp">炉</span>
          <span>
            <span className="font-display block text-2xl font-semibold">围炉</span>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.34em] text-white/50">
              WEILU COMMUNITY
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            A table for builders
          </p>
          <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.15]">
            把问题
            <br />
            摊开聊。
          </h1>
          <p className="mt-6 text-sm leading-7 text-white/65">
            不急着给答案。先说清背景，再讲你试过什么，最后一起看下一步。
          </p>
        </div>

        <p className="relative text-xs tracking-widest text-white/40">
          围炉 · 一个能聊事的社区
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link className="mb-8 flex items-center gap-3 lg:hidden" href="/login">
            <span className="brand-stamp">炉</span>
            <span>
              <span className="font-display block text-xl font-semibold">围炉</span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.3em] text-[var(--muted)]">
                WEILU
              </span>
            </span>
          </Link>
          {children}
        </div>
      </section>
    </div>
  );
}
