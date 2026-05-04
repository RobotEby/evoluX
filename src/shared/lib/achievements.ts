import type { Achievement } from '@/entities/workout/api/body';
import {
  getSessions,
  getPRs,
  getStreak,
  getAllFoodLogs,
  getBodyWeightLogs,
  getProgressPhotos,
} from './storage';

const ACHIEVEMENT_DEFS: Omit<Achievement, 'progress'>[] = [
  {
    id: 'streak-3',
    key: 'streak',
    title: 'Consistente',
    description: '3 dias seguidos treinando',
    icon: '🔥',
    target: 3,
  },
  {
    id: 'streak-7',
    key: 'streak',
    title: 'Semana de Fogo',
    description: '7 dias seguidos treinando',
    icon: '🔥',
    target: 7,
  },
  {
    id: 'streak-30',
    key: 'streak',
    title: 'Máquina',
    description: '30 dias seguidos treinando',
    icon: '💎',
    target: 30,
  },
  {
    id: 'session-1',
    key: 'sessions',
    title: 'Primeiro Treino',
    description: 'Complete seu primeiro treino',
    icon: '💪',
    target: 1,
  },
  {
    id: 'session-10',
    key: 'sessions',
    title: 'Dedicado',
    description: 'Complete 10 treinos',
    icon: '🏋️',
    target: 10,
  },
  {
    id: 'session-50',
    key: 'sessions',
    title: 'Veterano',
    description: 'Complete 50 treinos',
    icon: '🎖️',
    target: 50,
  },
  {
    id: 'pr-1',
    key: 'prs',
    title: 'Primeiro Record',
    description: 'Bata seu primeiro PR',
    icon: '🏆',
    target: 1,
  },
  {
    id: 'pr-5',
    key: 'prs',
    title: 'Colecionador',
    description: 'Acumule 5 PRs',
    icon: '🏆',
    target: 5,
  },
  {
    id: 'pr-10',
    key: 'prs',
    title: 'Lenda',
    description: 'Acumule 10 PRs',
    icon: '👑',
    target: 10,
  },
  {
    id: 'vol-10k',
    key: 'volume',
    title: '10 Toneladas',
    description: 'Levante 10.000 kg no total',
    icon: '⚡',
    target: 10000,
  },
  {
    id: 'vol-100k',
    key: 'volume',
    title: 'Monstro',
    description: 'Levante 100.000 kg no total',
    icon: '🦾',
    target: 100000,
  },
  {
    id: 'nutrition-7',
    key: 'nutrition',
    title: 'Dieta em Dia',
    description: 'Logue calorias por 7 dias',
    icon: '🍎',
    target: 7,
  },
  {
    id: 'weight-1',
    key: 'weight',
    title: 'Na Balança',
    description: 'Registre seu primeiro peso',
    icon: '⚖️',
    target: 1,
  },
  {
    id: 'photo-1',
    key: 'photo',
    title: 'Antes & Depois',
    description: 'Tire sua primeira foto de progresso',
    icon: '📸',
    target: 1,
  },
];

export function checkAndUnlockAchievements(): Achievement[] {
  const sessions = getSessions().filter((s) => s.completed);
  const prs = getPRs();
  const streak = getStreak();
  const foodLogs = getAllFoodLogs();
  const weightLogs = getBodyWeightLogs();
  const photos = getProgressPhotos();

  const totalVolume = sessions.reduce((s, sess) => s + sess.totalVolume, 0);
  const uniqueNutritionDays = new Set(foodLogs.map((l) => l.date)).size;

  const now = new Date().toISOString();

  return ACHIEVEMENT_DEFS.map((def) => {
    let progress = 0;
    switch (def.key) {
      case 'streak':
        progress = streak;
        break;
      case 'sessions':
        progress = sessions.length;
        break;
      case 'prs':
        progress = prs.length;
        break;
      case 'volume':
        progress = totalVolume;
        break;
      case 'nutrition':
        progress = uniqueNutritionDays;
        break;
      case 'weight':
        progress = weightLogs.length;
        break;
      case 'photo':
        progress = photos.length;
        break;
    }
    return {
      ...def,
      progress: Math.min(progress, def.target),
      unlockedAt: progress >= def.target ? now : undefined,
    };
  });
}
