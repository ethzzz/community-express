import { cookies } from 'next/headers';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  API_BASE,
  cookieOptions,
  getRefreshToken,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from './backend';

export type CookieToSet = {
  name: string;
  value: string;
  options: typeof cookieOptions & { maxAge: number };
};

export const ADMIN_API_BASE = process.env.ADMIN_API_URL ?? 'http://127.0.0.1:3002';

export async function callServiceWithAuth(
  base: string,
  path: string,
  init: RequestInit = {},
) {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  const refresh = store.get(REFRESH_COOKIE)?.value;
  const headers = new Headers(init.headers);
  if (access) headers.set('Authorization', `Bearer ${access}`);

  let response = await fetch(`${base}${path}`, { ...init, headers, cache: 'no-store' });
  const cookiesToSet: CookieToSet[] = [];

  if (response.status === 401 && refresh) {
    const refreshed = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { cookie: `${REFRESH_COOKIE}=${refresh}` },
    });

    if (refreshed.ok) {
      const data = (await refreshed.json()) as { accessToken: string };
      cookiesToSet.push({
        name: ACCESS_COOKIE,
        value: data.accessToken,
        options: { ...cookieOptions, maxAge: ACCESS_MAX_AGE },
      });
      const nextRefresh = getRefreshToken(refreshed.headers);
      if (nextRefresh) {
        cookiesToSet.push({
          name: REFRESH_COOKIE,
          value: nextRefresh,
          options: { ...cookieOptions, maxAge: REFRESH_MAX_AGE },
        });
      }

      headers.set('Authorization', `Bearer ${data.accessToken}`);
      response = await fetch(`${base}${path}`, { ...init, headers, cache: 'no-store' });
    }
  }

  return { response, cookiesToSet };
}

export function callBackendWithAuth(path: string, init: RequestInit = {}) {
  return callServiceWithAuth(API_BASE, path, init);
}
