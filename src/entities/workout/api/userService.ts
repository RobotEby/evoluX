/**
 * Service para gerenciamento de perfil e métricas corporais do usuário.
 */
import { api } from '@/shared/api/client';

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  gender?: string;
  birthDate?: string;
  heightCm?: number;
  weightKg?: number;
  fitnessLevel?: string;
  goal?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
  gender?: string;
  birthDate?: string;
  heightCm?: number;
  weightKg?: number;
  fitnessLevel?: string;
  goal?: string;
}

export interface BodyMetricsResponse {
  id: string;
  userId: string;
  weightKg?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  bmi?: number;
  measuredAt: string;
  createdAt: string;
}

export interface AddBodyMetricsRequest {
  weightKg: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  measuredAt?: string;
}

export const userService = {
  getProfile() {
    return api.get<UserProfileResponse>('/users/profile');
  },

  updateProfile(data: UpdateProfileRequest) {
    return api.put<UserProfileResponse>('/users/profile', data);
  },

  getBodyMetrics() {
    return api.get<BodyMetricsResponse[]>('/users/body-metrics');
  },

  addBodyMetrics(data: AddBodyMetricsRequest) {
    return api.post<BodyMetricsResponse>('/users/body-metrics', data);
  },
};