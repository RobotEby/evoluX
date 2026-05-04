import {
  UserPreferences,
  WorkoutPlan,
  WorkoutSession,
  PersonalRecord,
  ContentVideo,
} from '@/entities/workout/model/workout';
import {
  MOCK_USER,
  MOCK_PLANS,
  MOCK_SESSIONS,
  MOCK_PRS,
  MOCK_VIDEOS,
} from '@/entities/workout/api/mock-data';
import type { FoodLog, NutritionGoals } from '@/entities/workout/api/nutrition';
import type { BodyWeightLog, BodyMeasurement, ProgressPhoto } from '@/entities/workout/api/body';

/** Persistência local. Sincronização com o servidor: `@/shared/api` + `@/shared/lib/supabase` (substituição gradual). */
const KEYS = {
  user: 'progressao_user',
  plans: 'progressao_plans',
  sessions: 'progressao_sessions',
  prs: 'progressao_prs',
  favorites: 'progressao_favorites',
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const getUser = () => get<UserPreferences>(KEYS.user, MOCK_USER);
export const saveUser = (u: UserPreferences) => set(KEYS.user, u);

export const getPlans = () => get<WorkoutPlan[]>(KEYS.plans, MOCK_PLANS);
export const savePlans = (p: WorkoutPlan[]) => set(KEYS.plans, p);
export const addPlan = (p: WorkoutPlan) => {
  const all = getPlans();
  all.push(p);
  savePlans(all);
};
export const updatePlan = (p: WorkoutPlan) => {
  const all = getPlans().map((x) => (x.id === p.id ? p : x));
  savePlans(all);
};
export const deletePlan = (id: string) => savePlans(getPlans().filter((x) => x.id !== id));

export const getSessions = () => get<WorkoutSession[]>(KEYS.sessions, MOCK_SESSIONS);
export const saveSessions = (s: WorkoutSession[]) => set(KEYS.sessions, s);
export const addSession = (s: WorkoutSession) => {
  const all = getSessions();
  all.push(s);
  saveSessions(all);
};

export const getPRs = () => get<PersonalRecord[]>(KEYS.prs, MOCK_PRS);
export const savePRs = (p: PersonalRecord[]) => set(KEYS.prs, p);
export const addPR = (pr: PersonalRecord) => {
  const all = getPRs();
  const idx = all.findIndex((x) => x.exerciseId === pr.exerciseId);
  if (idx >= 0) all[idx] = pr;
  else all.push(pr);
  savePRs(all);
  return pr;
};

export const getFavorites = () => get<string[]>(KEYS.favorites, []);
export const toggleFavorite = (videoId: string) => {
  const favs = getFavorites();
  const next = favs.includes(videoId) ? favs.filter((x) => x !== videoId) : [...favs, videoId];
  set(KEYS.favorites, next);
  return next;
};

export const getVideos = (): ContentVideo[] => {
  const favs = getFavorites();
  return MOCK_VIDEOS.map((v) => ({ ...v, isFavorite: favs.includes(v.id) }));
};

const NUTRITION_LOGS_KEY = 'progressao_food_logs';
const NUTRITION_GOALS_KEY = 'progressao_nutrition_goals';

const DEFAULT_GOALS: NutritionGoals = { calories: 2200, protein: 150, carbs: 250, fat: 70 };

export const getNutritionGoals = (): NutritionGoals =>
  get<NutritionGoals>(NUTRITION_GOALS_KEY, DEFAULT_GOALS);
export const saveNutritionGoals = (g: NutritionGoals) => set(NUTRITION_GOALS_KEY, g);

export const getAllFoodLogs = (): FoodLog[] => get<FoodLog[]>(NUTRITION_LOGS_KEY, []);
export const getFoodLogs = (date: string): FoodLog[] =>
  getAllFoodLogs().filter((l) => l.date === date);
export const addFoodLog = (log: FoodLog) => {
  const all = getAllFoodLogs();
  all.push(log);
  set(NUTRITION_LOGS_KEY, all);
};
export const deleteFoodLog = (id: string) => {
  set(
    NUTRITION_LOGS_KEY,
    getAllFoodLogs().filter((l) => l.id !== id)
  );
};

const BODY_WEIGHT_KEY = 'progressao_body_weight';
const BODY_MEASUREMENTS_KEY = 'progressao_body_measurements';
const PROGRESS_PHOTOS_KEY = 'progressao_progress_photos';

export const getBodyWeightLogs = (): BodyWeightLog[] => get<BodyWeightLog[]>(BODY_WEIGHT_KEY, []);
export const addBodyWeightLog = (log: BodyWeightLog) => {
  const all = getBodyWeightLogs();
  all.push(log);
  set(BODY_WEIGHT_KEY, all);
};

export const getBodyMeasurements = (): BodyMeasurement[] =>
  get<BodyMeasurement[]>(BODY_MEASUREMENTS_KEY, []);
export const addBodyMeasurement = (m: BodyMeasurement) => {
  const all = getBodyMeasurements();
  all.push(m);
  set(BODY_MEASUREMENTS_KEY, all);
};

export const getProgressPhotos = (): ProgressPhoto[] =>
  get<ProgressPhoto[]>(PROGRESS_PHOTOS_KEY, []);
export const addProgressPhoto = (p: ProgressPhoto) => {
  const all = getProgressPhotos();
  all.push(p);
  set(PROGRESS_PHOTOS_KEY, all);
};
export const deleteProgressPhoto = (id: string) =>
  set(
    PROGRESS_PHOTOS_KEY,
    getProgressPhotos().filter((p) => p.id !== id)
  );

export const getStreak = (): number => {
  const sessions = getSessions()
    .filter((s) => s.completed)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!sessions.length) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasSession = sessions.some((s) => s.date === dateStr);
    if (hasSession) {
      streak++;
    } else if (streak > 0 && i > 0) break;
  }
  return streak;
};
