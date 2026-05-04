/** Base URL da API (sem barra final). */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL ?? '';
  return raw.replace(/\/+$/, '');
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL ?? '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  return url.length > 0 && key.length > 0;
}
