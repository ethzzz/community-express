export function isJwtExpired(token: string | undefined): boolean {
  if (!token) return true;
  const payload = token.split('.')[1];
  if (!payload) return true;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const data = JSON.parse(atob(padded)) as { exp?: number };
    return typeof data.exp !== 'number' || data.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
