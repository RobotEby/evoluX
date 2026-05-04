import { getApiBaseUrl } from './env';

export type ApiFetchOptions = RequestInit & {
  accessToken?: string;
};

export async function apiFetch<T = unknown>(path: string, init: ApiFetchOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error('VITE_API_URL is not set');
  }
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (init.accessToken) {
    headers.set('Authorization', `Bearer ${init.accessToken}`);
  }
  const { accessToken: _a, ...rest } = init;
  const res = await fetch(url, { ...rest, headers });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) msg = body.error;
    } catch {
      try {
        msg = await res.text();
      } catch {
        /* ignore */
      }
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}
