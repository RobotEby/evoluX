export type MuscleGroup =
  | 'peito'
  | 'costas'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'quadriceps'
  | 'posteriores'
  | 'gluteos'
  | 'panturrilhas'
  | 'abdomen'
  | 'antebracos'
  | 'trapezio';

export type Technique =
  | 'normal'
  | 'rest-pause'
  | 'drop-set'
  | 'muscle-rounds'
  | 'myo-reps'
  | 'cluster-sets'
  | 'super-set'
  | 'giant-set';

export type DivisionType = 'ppl' | 'upper-lower' | 'arnold' | 'bro-split' | 'full-body' | 'custom';

export type Goal = 'hipertrofia' | 'forca';
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment?: string;
  videoUrl?: string;
}

export interface PlanExercise {
  id: string;
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  technique: Technique;
  restSeconds: number;
  baseLoad?: number;
  notes?: string;
  order: number;
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g., "Peito e Tríceps"
  exercises: PlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  divisionType: DivisionType;
  daysPerWeek: number;
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;
  technique: Technique;
  clusters?: number[]; // for rest-pause: [8, 3, 2]
  drops?: { weight: number; reps: number }[]; // for drop-sets
  isPersonalRecord?: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  notes?: string;
  skipped?: boolean;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  dayId: string;
  dayName: string;
  date: string;
  duration: number; // minutes
  exercises: ExerciseLog[];
  totalVolume: number;
  completed: boolean;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
}

export interface UserPreferences {
  name: string;
  goal: Goal;
  experience: ExperienceLevel;
  preferredSplit: DivisionType;
  onboardingComplete: boolean;
}

export interface ContentVideo {
  id: string;
  title: string;
  creator: string;
  creatorAvatar?: string;
  thumbnailUrl: string;
  youtubeId: string;
  technique?: Technique;
  muscleGroups: MuscleGroup[];
  isFavorite?: boolean;
}

export const TECHNIQUE_LABELS: Record<Technique, string> = {
  normal: 'Normal',
  'rest-pause': 'Rest-Pause',
  'drop-set': 'Drop Set',
  'muscle-rounds': 'Muscle Rounds',
  'myo-reps': 'Myo-Reps',
  'cluster-sets': 'Cluster Sets',
  'super-set': 'Super Set',
  'giant-set': 'Giant Set',
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  peito: 'Peito',
  costas: 'Costas',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  quadriceps: 'Quadríceps',
  posteriores: 'Posteriores',
  gluteos: 'Glúteos',
  panturrilhas: 'Panturrilhas',
  abdomen: 'Abdômen',
  antebracos: 'Antebraços',
  trapezio: 'Trapézio',
};

export const DIVISION_LABELS: Record<DivisionType, string> = {
  ppl: 'Push/Pull/Legs',
  'upper-lower': 'Upper/Lower',
  arnold: 'Arnold Split',
  'bro-split': 'Bro Split',
  'full-body': 'Full Body',
  custom: 'Personalizado',
};
