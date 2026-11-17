import { cookies } from 'next/headers';
import { ACCESS_COOKIE } from './backend';
import { ADMIN_API_BASE } from './server-api';

export async function adminJson<T>(path: string): Promise<T> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  if (!access) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ADMIN_API_BASE}/api/v1/admin${path}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`admin api ${response.status}`);
  }

  return response.json() as Promise<T>;
}
