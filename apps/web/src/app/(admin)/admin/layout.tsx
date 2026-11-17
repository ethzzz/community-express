import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { ACCESS_COOKIE } from '@/lib/backend';
import { decodeJwt } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  if (!access) redirect('/login?next=/admin');

  const claims = decodeJwt(access);
  if (!claims?.roles?.includes('admin')) redirect('/feed');

  return <AdminShell>{children}</AdminShell>;
}
