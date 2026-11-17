export type JwtClaims = {
  sub?: string;
  roles?: string[];
  permissions?: string[];
  exp?: number;
};

export function decodeJwt(token: string | undefined): JwtClaims | null {
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as JwtClaims;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string | undefined): boolean {
  const claims = decodeJwt(token);
  return !claims || typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now();
}
