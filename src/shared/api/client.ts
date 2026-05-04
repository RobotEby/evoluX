import { getApiBaseUrl } from './env';

interface ApiError {
  status: number;
  error: string;
  message: string;
}

class ApiClient {
  private getBaseUrl(): string {
    const base = getApiBaseUrl();
    if (!base) throw new Error('VITE_API_URL is not set');
    return base;
  }

  private getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const base = this.getBaseUrl();
    const url = path.startsWith('http')
      ? path
      : `${base}${path.startsWith('/') ? path : `/${path}`}`;

    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      let msg = response.statusText;
      try {
        const body = (await response.json()) as ApiError;
        msg = body?.message || body?.error || msg;
      } catch {
        try {
          msg = await response.text();
        } catch {
          /* ignore */
        }
      }
      throw new Error(msg);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = void>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();