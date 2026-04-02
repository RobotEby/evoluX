import {
  UserPreferences,
  WorkoutPlan,
  WorkoutSession,
  PersonalRecord,
  ContentVideo,
} from '../../entities/workout/model/workout';
import {
  MOCK_USER,
  MOCK_PLANS,
  MOCK_SESSIONS,
  MOCK_PRS,
  MOCK_VIDEOS,
} from '../../entities/workout/api/mock-data';

const KEYS = {
  user: 'evolux_user',
  plans: 'evolux_plans',
  sessions: 'evolux_sessions',
  prs: 'evolux_prs',
  favorites: 'evolux_favorites',
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

// User
export const getUser = () => get<UserPreferences>(KEYS.user, MOCK_USER);
export const saveUser = (u: UserPreferences) => set(KEYS.user, u);

// Plans
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

// Sessions
export const getSessions = () => get<WorkoutSession[]>(KEYS.sessions, MOCK_SESSIONS);
export const saveSessions = (s: WorkoutSession[]) => set(KEYS.sessions, s);
export const addSession = (s: WorkoutSession) => {
  const all = getSessions();
  all.push(s);
  saveSessions(all);
};

// PRs
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

// Favorites
export const getFavorites = () => get<string[]>(KEYS.favorites, []);
export const toggleFavorite = (videoId: string) => {
  const favs = getFavorites();
  const next = favs.includes(videoId) ? favs.filter((x) => x !== videoId) : [...favs, videoId];
  set(KEYS.favorites, next);
  return next;
};

// Videos (from mock, with favorites merged)
export const getVideos = (): ContentVideo[] => {
  const favs = getFavorites();
  return MOCK_VIDEOS.map((v) => ({ ...v, isFavorite: favs.includes(v.id) }));
};

// Calculate streak
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
