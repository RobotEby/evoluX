/**
 * Service para comunicação com endpoints de exercícios.
 * Substitui os dados mockados por chamadas reais à API.
 */
import { api } from '@/shared/api/client';

export interface ExerciseResponse {
  id: string;
  name: string;
  description?: string;
  category?: string;
  muscleGroupPrimary: string;
  secondaryMuscles?: string[];
  equipment?: string;
  difficultyLevel?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  isCustom: boolean;
}

export interface CreateExerciseRequest {
  name: string;
  muscleGroupPrimary: string;
  description?: string;
  category?: string;
  equipment?: string;
  difficultyLevel?: string;
}

export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  category?: string;
  equipment?: string;
  difficultyLevel?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export const exerciseService = {
  list(params?: { page?: number; size?: number; name?: string; muscleGroup?: string; equipment?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.set('page', String(params.page));
    if (params?.size !== undefined) searchParams.set('size', String(params.size));
    if (params?.name) searchParams.set('name', params.name);
    if (params?.muscleGroup) searchParams.set('muscleGroup', params.muscleGroup);
    if (params?.equipment) searchParams.set('equipment', params.equipment);
    return api.get<ExerciseResponse[]>(`/exercises?${searchParams}`);
  },

  getById(id: string) {
    return api.get<ExerciseResponse>(`/exercises/${id}`);
  },

  getByMuscle(muscleGroup: string) {
    return api.get<ExerciseResponse[]>(`/exercises/muscle/${muscleGroup}`);
  },

  create(data: CreateExerciseRequest) {
    return api.post<ExerciseResponse>('/exercises', data);
  },

  update(id: string, data: UpdateExerciseRequest) {
    return api.put<ExerciseResponse>(`/exercises/${id}`, data);
  },

  remove(id: string) {
    return api.delete(`/exercises/${id}`);
  },
};