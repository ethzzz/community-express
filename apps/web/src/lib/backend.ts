export const API_BASE = process.env.API_BASE_INTERNAL ?? 'http://127.0.0.1:3000';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
export const ACCESS_MAX_AGE = 15 * 60;
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function getRefreshToken(headers: Headers): string | undefined {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const values = getSetCookie ? getSetCookie.call(headers) : [headers.get('set-cookie') ?? ''];
  for (const value of values) {
    const match = value.match(/refresh_token=([^;]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return undefined;
}
