/**
 * Service para gerenciamento de rotinas de treino.
 */
import { api } from '@/shared/api/client';

export interface RoutineResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  goal?: string;
  estimatedDurationMin?: number;
  difficultyLevel?: string;
  isPublic: boolean;
  isActive: boolean;
  days?: RoutineDayResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineDayResponse {
  id: string;
  routineId: string;
  dayNumber: number;
  name?: string;
  notes?: string;
  exercises: RoutineDayExerciseResponse[];
}

export interface RoutineDayExerciseResponse {
  id: string;
  routineDayId: string;
  exerciseId: string;
  exerciseName?: string;
  position: number;
  sets: number;
  repsTarget: number;
  weightTargetKg?: number;
  restSeconds: number;
  durationSeconds: number;
  notes?: string;
}

export interface CreateRoutineRequest {
  name: string;
  description?: string;
  goal?: string;
  estimatedDurationMin?: number;
  difficultyLevel?: string;
}

export interface UpdateRoutineRequest {
  name?: string;
  description?: string;
  goal?: string;
  estimatedDurationMin?: number;
  difficultyLevel?: string;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface AddDayRequest {
  dayNumber: number;
  name?: string;
  notes?: string;
}

export interface AddExerciseRequest {
  exerciseId: string;
  sets: number;
  repsTarget: number;
  weightTargetKg?: number;
  restSeconds?: number;
  durationSeconds?: number;
  notes?: string;
}

export const routineService = {
  list() {
    return api.get<RoutineResponse[]>('/routines');
  },

  getById(id: string) {
    return api.get<RoutineResponse>(`/routines/${id}`);
  },

  listPublic() {
    return api.get<RoutineResponse[]>('/routines/public');
  },

  create(data: CreateRoutineRequest) {
    return api.post<RoutineResponse>('/routines', data);
  },

  update(id: string, data: UpdateRoutineRequest) {
    return api.put<RoutineResponse>(`/routines/${id}`, data);
  },

  remove(id: string) {
    return api.delete(`/routines/${id}`);
  },

  // Days
  addDay(routineId: string, data: AddDayRequest) {
    return api.post<RoutineDayResponse>(`/routines/${routineId}/days`, data);
  },

  removeDay(routineId: string, dayId: string) {
    return api.delete(`/routines/${routineId}/days/${dayId}`);
  },

  // Exercises within a day
  addExercise(routineId: string, dayId: string, data: AddExerciseRequest) {
    return api.post<RoutineDayExerciseResponse>(
      `/routines/${routineId}/days/${dayId}/exercises`,
      data
    );
  },

  updateExercise(
    routineId: string,
    dayId: string,
    exerciseId: string,
    data: AddExerciseRequest
  ) {
    return api.put<RoutineDayExerciseResponse>(
      `/routines/${routineId}/days/${dayId}/exercises/${exerciseId}`,
      data
    );
  },

  removeExercise(routineId: string, dayId: string, exerciseId: string) {
    return api.delete(
      `/routines/${routineId}/days/${dayId}/exercises/${exerciseId}`
    );
  },
};