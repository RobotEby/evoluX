import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, TrendingUp, Play, Zap, Dumbbell, User, Apple, Scale, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { ThemeToggle } from '@/features/theme-toggle/ui/ThemeToggle';
import {
  routineService,
  sessionService,
  recordService,
  userService,
  mapRoutineToPlan,
  mapRecordToPR,
  mapProfileToPreferences,
  calculateStreak,
} from '@/entities/workout/api';
import type {
  UserPreferences,
  WorkoutPlan,
  PersonalRecord,
} from '@/entities/workout/model/workout';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserPreferences | null>(null);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [weeklyVolume, setWeeklyVolume] = useState(0);
  const [todayCalories] = useState(0);
  const [calorieGoal] = useState(2200);
  const [currentWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getProfile().then(mapProfileToPreferences),
      routineService.list().then((routines) => routines.map(mapRoutineToPlan)),
      recordService.list().then((records) => records.map(mapRecordToPR)),
      sessionService.list(0, 100),
    ])
      .then(([profile, plansData, prsData, sessions]) => {
        setUser(profile);
        setPlans(plansData);
        setPrs(prsData);

        const completedDates = sessions
          .filter((s) => s.status === 'COMPLETED')
          .map((s) => s.startedAt?.split('T')[0] ?? '');
        setStreak(calculateStreak(completedDates));

        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekVol = sessions
          .filter((s) => s.status === 'COMPLETED' && new Date(s.startedAt || '') >= weekAgo)
          .reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);
        setWeeklyVolume(weekVol);
      })
      .catch(() => {
        setUser(null);
        setPlans([]);
        setPrs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const nextPlan = plans[0];
  const nextDay = nextPlan?.days[0];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-primary md:hidden" />
            <span className="text-sm text-muted-foreground md:hidden font-display font-bold tracking-tight">
              EVOLUX
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold">Olá, {user.name}! 💪</h1>
          <p className="text-muted-foreground text-sm">Pronto para evoluir hoje?</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/perfil')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Flame className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold">{streak} dias</p>
            <p className="text-sm text-muted-foreground">Sequência de treinos</p>
          </div>
        </CardContent>
      </Card>

      {nextPlan && nextDay && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              Próximo Treino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{nextDay.name}</p>
              <p className="text-sm text-muted-foreground">
                {nextPlan.name} · {nextDay.exercises.length} exercícios
              </p>
            </div>
            <Button
              className="w-full touch-target glow-primary text-base font-semibold"
              onClick={() => navigate('/treino')}
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar Treino
            </Button>
          </CardContent>
        </Card>
      )}

      <Card
        className="cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => navigate('/calorias')}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative h-14 w-14 flex-shrink-0">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - Math.min(todayCalories / calorieGoal, 1))}
                transform="rotate(-90 28 28)"
              />
            </svg>
            <Apple className="h-4 w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <p className="text-lg font-display font-bold">
              {todayCalories} / {calorieGoal} kcal
            </p>
            <p className="text-xs text-muted-foreground">Calorias de hoje</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card
          className="cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => navigate('/progresso')}
        >
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-accent mb-2" />
            <p className="text-xl font-display font-bold">{(weeklyVolume / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Volume (kg)</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => navigate('/progresso')}
        >
          <CardContent className="p-4">
            <Trophy className="h-5 w-5 text-warning mb-2" />
            <p className="text-xl font-display font-bold">{prs.length}</p>
            <p className="text-xs text-muted-foreground">Records</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => navigate('/corpo')}
        >
          <CardContent className="p-4">
            <Scale className="h-5 w-5 text-primary mb-2" />
            <p className="text-xl font-display font-bold">{currentWeight ?? '--'}</p>
            <p className="text-xs text-muted-foreground">Peso (kg)</p>
          </CardContent>
        </Card>
      </div>

      {prs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              Records Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {prs.slice(0, 3).map((pr) => (
              <div key={pr.exerciseId} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium">{pr.exerciseName}</p>
                  <p className="text-xs text-muted-foreground">{pr.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    {pr.weight}kg × {pr.reps}
                  </p>
                  <p className="text-xs text-muted-foreground">1RM: {pr.estimated1RM}kg</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}