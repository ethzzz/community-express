export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}
