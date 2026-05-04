/**
 * Barrel export — serviços reais da API Evolux.
 *
 * Uso:
 *   import { exerciseService, routineService, authService } from '@/entities/workout/api';
 *
 * Os dados mockados (mock-data.ts) continuam disponíveis para desenvolvimento
 * offline e testes. Basta substituir as importações nas páginas de:
 *   import { MOCK_PLANS } from ...
 * para:
 *   import { routineService } from ...
 *   const plans = await routineService.list();
 */

export { authService } from './authService';
export { exerciseService } from './exerciseService';
export { routineService } from './routineService';
export { sessionService } from './sessionService';
export { recordService } from './recordService';
export { userService } from './userService';

// Mappers (conversão API → tipos do frontend)
export {
  mapRoutineToPlan,
  mapSessionToWorkoutSession,
  mapRecordToPR,
  mapExerciseResponseToDomain,
  mapProfileToPreferences,
  calculateStreak,
} from './mappers';
