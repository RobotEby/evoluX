import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, TrendingUp, Play, Zap, Dumbbell, Loader2 } from 'lucide-react';
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

        // Streak a partir das datas das sessões concluídas
        const completedDates = sessions
          .filter((s) => s.status === 'COMPLETED')
          .map((s) => s.startedAt?.split('T')[0] ?? '');
        setStreak(calculateStreak(completedDates));

        // Volume semanal
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
              evoluX
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold">Olá, {user.name}! 💪</h1>
          <p className="text-muted-foreground text-sm">Pronto para evoluir hoje?</p>
        </div>
        <div className="md:hidden">
          <ThemeToggle />
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

      <div className="grid grid-cols-2 gap-3">
        <Card
          className="cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => navigate('/progresso')}
        >
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-accent mb-2" />
            <p className="text-xl font-display font-bold">{(weeklyVolume / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Volume semanal (kg)</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => navigate('/progresso')}
        >
          <CardContent className="p-4">
            <Trophy className="h-5 w-5 text-warning mb-2" />
            <p className="text-xl font-display font-bold">{prs.length}</p>
            <p className="text-xs text-muted-foreground">Records pessoais</p>
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