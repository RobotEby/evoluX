/**
 * Service para gerenciamento de sessões de treino.
 */
import { api } from '@/shared/api/client';

export interface SessionResponse {
  id: string;
  userId: string;
  routineId?: string;
  routineDayId?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  finishedAt?: string;
  durationSeconds?: number;
  totalVolumeKg?: number;
  notes?: string;
  perceivedEffort?: number;
  sets?: SessionSetResponse[];
}

export interface SessionSetResponse {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  repsDone?: number;
  weightKg?: number;
  durationSeconds?: number;
  isCompleted: boolean;
  isWarmup: boolean;
  performedAt: string;
}

export interface StartSessionRequest {
  routineId?: string;
  routineDayId?: string;
}

export interface AddSetRequest {
  exerciseId: string;
  setNumber: number;
  repsDone: number;
  weightKg?: number;
  durationSeconds?: number;
  isCompleted: boolean;
  isWarmup: boolean;
}

export interface CompleteSessionRequest {
  notes?: string;
  perceivedEffort?: number;
}

export interface CancelSessionRequest {
  reason?: string;
}

export const sessionService = {
  list(page = 0, size = 10) {
    return api.get<SessionResponse[]>(`/sessions?page=${page}&size=${size}`);
  },

  getById(id: string) {
    return api.get<SessionResponse>(`/sessions/${id}`);
  },

  getActive() {
    return api.get<SessionResponse>('/sessions/active');
  },

  start(data?: StartSessionRequest) {
    return api.post<SessionResponse>('/sessions', data || {});
  },

  addSet(sessionId: string, data: AddSetRequest) {
    return api.post<SessionSetResponse>(`/sessions/${sessionId}/sets`, data);
  },

  complete(sessionId: string, data?: CompleteSessionRequest) {
    return api.post<SessionResponse>(
      `/sessions/${sessionId}/complete`,
      data || {}
    );
  },

  cancel(sessionId: string, data?: CancelSessionRequest) {
    return api.post<SessionResponse>(
      `/sessions/${sessionId}/cancel`,
      data || {}
    );
  },
};