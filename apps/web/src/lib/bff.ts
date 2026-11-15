export async function bffFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/proxy${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
