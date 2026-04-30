/**
 * Funções de mapeamento entre respostas da API e os tipos do frontend.
 *
 * Como os tipos da API REST (RoutineResponse, SessionResponse, etc.) têm
 * estruturas diferentes dos tipos de domínio do frontend (WorkoutPlan,
 * WorkoutSession, etc.), este módulo converte entre os dois formatos.
 */
import type { RoutineResponse, RoutineDayResponse, RoutineDayExerciseResponse } from './routineService';
import type { SessionResponse, SessionSetResponse } from './sessionService';
import type { PersonalRecordResponse } from './recordService';
import type { ExerciseResponse } from './exerciseService';
import type { UserProfileResponse } from './userService';
import type {
  WorkoutPlan,
  WorkoutDay,
  PlanExercise,
  WorkoutSession,
  ExerciseLog,
  SetLog,
  PersonalRecord,
  UserPreferences,
  Exercise,
  Technique,
  DivisionType,
  Goal,
  ExperienceLevel,
  MuscleGroup,
} from '../model/workout';

// ──────────────────────── Routine → WorkoutPlan ────────────────────────

/** Mapeia uma rotina da API para um WorkoutPlan do frontend */
export function mapRoutineToPlan(r: RoutineResponse): WorkoutPlan {
  return {
    id: r.id,
    name: r.name,
    divisionType: inferDivision(r.days?.length || 0, r.goal),
    daysPerWeek: r.days?.length || 0,
    days: (r.days || []).map(mapRoutineDayToDay),
    createdAt: r.createdAt?.split('T')[0] ?? '',
    updatedAt: r.updatedAt?.split('T')[0] ?? '',
  };
}

function inferDivision(dayCount: number, goal?: string): DivisionType {
  if (dayCount <= 2) return 'full-body';
  if (dayCount <= 3) return goal === 'forca' ? 'upper-lower' : 'ppl';
  if (dayCount === 4) return 'upper-lower';
  if (dayCount <= 6) return 'ppl';
  return 'custom';
}

function mapRoutineDayToDay(d: RoutineDayResponse): WorkoutDay {
  return {
    id: d.id,
    name: d.name || `Dia ${d.dayNumber}`,
    exercises: (d.exercises || []).map(mapDayExerciseToPlanExercise),
  };
}

function mapDayExerciseToPlanExercise(e: RoutineDayExerciseResponse): PlanExercise {
  return {
    id: e.id,
    exerciseId: e.exerciseId,
    sets: e.sets,
    repsMin: e.repsTarget,
    repsMax: e.repsTarget,
    technique: 'normal',
    restSeconds: e.restSeconds || 90,
    baseLoad: e.weightTargetKg ?? undefined,
    order: e.position,
  };
}

// ──────────────────────── Session → WorkoutSession ────────────────────────

export function mapSessionToWorkoutSession(s: SessionResponse): WorkoutSession {
  const exercises = groupSetsByExercise(s.sets || []);
  const totalVolume = exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0),
    0
  );

  return {
    id: s.id,
    planId: s.routineId || '',
    dayId: s.routineDayId || '',
    dayName: '',
    date: s.startedAt?.split('T')[0] ?? '',
    duration: s.durationSeconds ? Math.round(s.durationSeconds / 60) : 0,
    exercises,
    totalVolume,
    completed: s.status === 'COMPLETED',
  };
}

function groupSetsByExercise(sets: SessionSetResponse[]): ExerciseLog[] {
  const map = new Map<string, SessionSetResponse[]>();
  for (const s of sets) {
    const list = map.get(s.exerciseId) || [];
    list.push(s);
    map.set(s.exerciseId, list);
  }
  return Array.from(map.entries()).map(([exerciseId, exSets]) => ({
    exerciseId,
    exerciseName: '',
    sets: exSets.map(mapSessionSetToSetLog),
  }));
}

function mapSessionSetToSetLog(s: SessionSetResponse): SetLog {
  return {
    setNumber: s.setNumber,
    reps: s.repsDone || 0,
    weight: s.weightKg || 0,
    technique: s.isWarmup ? 'normal' : 'normal',
  };
}

// ──────────────────────── PersonalRecord ────────────────────────

export function mapRecordToPR(r: PersonalRecordResponse): PersonalRecord {
  const weight = r.prType === 'ONE_RM' || r.prType === 'MAX_REPS' ? r.value : 0;
  const reps = r.prType === 'MAX_REPS' ? r.value : 0;
  return {
    exerciseId: r.exerciseId,
    exerciseName: r.exerciseName || '',
    weight,
    reps,
    estimated1RM: r.prType === 'ONE_RM' ? r.value : Math.round(weight * (1 + reps / 30)),
    date: r.achievedAt?.split('T')[0] ?? '',
  };
}

// ──────────────────────── Exercise ────────────────────────

export function mapExerciseResponseToDomain(e: ExerciseResponse): Exercise {
  return {
    id: e.id,
    name: e.name,
    muscleGroups: [e.muscleGroupPrimary as MuscleGroup, ...(e.secondaryMuscles || []) as MuscleGroup[]],
    equipment: e.equipment,
    videoUrl: e.videoUrl,
  };
}

// ──────────────────────── User → UserPreferences ────────────────────────

export function mapProfileToPreferences(p: UserProfileResponse): UserPreferences {
  return {
    name: p.name,
    goal: mapGoal(p.goal),
    experience: mapExperience(p.fitnessLevel),
    preferredSplit: 'ppl',
    onboardingComplete: true,
  };
}

function mapGoal(goal?: string): Goal {
  if (goal === 'forca' || goal === 'strength') return 'forca';
  return 'hipertrofia';
}

function mapExperience(level?: string): ExperienceLevel {
  if (level === 'beginner' || level === 'iniciante') return 'iniciante';
  if (level === 'advanced' || level === 'avancado') return 'avancado';
  return 'intermediario';
}

// ──────────────────────── Utilitários ────────────────────────

/**
 * Calcula o streak de dias consecutivos de treino a partir de uma lista de
 * datas de sessões concluídas (formato 'YYYY-MM-DD').
 */
export function calculateStreak(dates: string[]): number {
  const unique = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  if (!unique.length) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (unique.includes(dateStr)) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }
  return streak;
}