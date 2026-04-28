/**
 * Service para autenticação (registro, login, refresh).
 */
import { api } from '@/shared/api/client';

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  goal?: string;
  fitnessLevel?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export const authService = {
  register(data: RegisterRequest) {
    return api.post<AuthResponse>('/auth/register', data);
  },

  login(data: LoginRequest) {
    return api.post<AuthResponse>('/auth/login', data);
  },

  refresh(refreshToken: string) {
    return api.post<{ accessToken: string; tokenType: string; expiresIn: number }>(
      '/auth/refresh',
      { refreshToken }
    );
  },

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};