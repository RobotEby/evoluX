/**
 * Service para gerenciamento de recordes pessoais.
 */
import { api } from '@/shared/api/client';

export interface PersonalRecordResponse {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName?: string;
  prType: 'ONE_RM' | 'MAX_REPS' | 'VOLUME' | 'ENDURANCE' | 'CUSTOM';
  value: number;
  unit?: string;
  sessionId?: string;
  achievedAt: string;
}

export interface CreateRecordRequest {
  exerciseId: string;
  prType: string;
  value: number;
  unit?: string;
  sessionId?: string;
}

export const recordService = {
  list() {
    return api.get<PersonalRecordResponse[]>('/personal-records');
  },

  listLatest() {
    return api.get<PersonalRecordResponse[]>('/personal-records/latest');
  },

  getByExercise(exerciseId: string) {
    return api.get<PersonalRecordResponse[]>(
      `/personal-records/exercise/${exerciseId}`
    );
  },

  create(data: CreateRecordRequest) {
    return api.post<PersonalRecordResponse>('/personal-records', data);
  },
};