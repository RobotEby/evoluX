import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Flame, Trophy, Dumbbell, BarChart3 } from 'lucide-react';
import { Button } from '@/shared/ui/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Input } from '@/shared/ui/ui/input';
import { Label } from '@/shared/ui/ui/label';
import { Badge } from '@/shared/ui/ui/badge';
import { cn } from '@/shared/lib/utils';
import { getUser, saveUser, getSessions, getPRs, getStreak } from '@/shared/lib/storage';
import { ThemeToggle } from '@/features/theme-toggle/ui/ThemeToggle';
import type {
  UserPreferences,
  Goal,
  ExperienceLevel,
  DivisionType,
} from '@/entities/workout/model/workout';
import { DIVISION_LABELS } from '@/entities/workout/model/workout';
import { fetchMe, isApiConfigured, type MeResponse } from '@/shared/api';
import { getSupabase } from '@/shared/lib/supabase';

const goals: { value: Goal; label: string }[] = [
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'forca', label: 'Força' },
];

const levels: { value: ExperienceLevel; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];

const splits: { value: DivisionType; label: string }[] = Object.entries(DIVISION_LABELS).map(
  ([value, label]) => ({ value: value as DivisionType, label })
);

export default function Perfil() {
  const [user, setUser] = useState<UserPreferences>(getUser());
  const [saved, setSaved] = useState(false);
  const [remoteMe, setRemoteMe] = useState<MeResponse | null>(null);
  const [remoteStatus, setRemoteStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);

  const sessions = getSessions();
  const prs = getPRs();
  const streak = getStreak();
  const totalSessions = sessions.filter((s) => s.completed).length;
  const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolume, 0);

  const handleSave = () => {
    saveUser(user);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    if (!isApiConfigured()) {
      setRemoteStatus('idle');
      setRemoteMessage(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setRemoteStatus('loading');
      setRemoteMessage(null);
      const supabase = getSupabase();
      if (!supabase) {
        if (!cancelled) {
          setRemoteStatus('error');
          setRemoteMessage('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para obter sessão.');
        }
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (!cancelled) {
          setRemoteStatus('idle');
          setRemoteMessage('Faça login no Supabase para carregar /me na API.');
          setRemoteMe(null);
        }
        return;
      }
      try {
        const me = await fetchMe(token);
        if (!cancelled) {
          setRemoteMe(me);
          setRemoteStatus('idle');
        }
      } catch (e) {
        if (!cancelled) {
          setRemoteStatus('error');
          setRemoteMessage(e instanceof Error ? e.message : 'Falha ao chamar API');
          setRemoteMe(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Perfil</h1>
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <span className="text-2xl font-display font-bold text-primary">{initials}</span>
          </motion.div>
          <Input
            value={user.name}
            onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
            className="text-center text-lg font-semibold max-w-[200px]"
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {goals.map((g) => (
              <Button
                key={g.value}
                variant={user.goal === g.value ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setUser((u) => ({ ...u, goal: g.value }))}
              >
                {g.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              Nível
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {levels.map((l) => (
              <Button
                key={l.value}
                variant={user.experience === l.value ? 'default' : 'outline'}
                className="flex-1 text-xs"
                onClick={() => setUser((u) => ({ ...u, experience: l.value }))}
              >
                {l.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              Divisão Preferida
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {splits.map((s) => (
              <Badge
                key={s.value}
                variant={user.preferredSplit === s.value ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer px-3 py-1.5 text-sm',
                  user.preferredSplit === s.value && 'bg-primary text-primary-foreground'
                )}
                onClick={() => setUser((u) => ({ ...u, preferredSplit: s.value }))}
              >
                {s.label}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full touch-target" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? 'Salvo! ✓' : 'Salvar Alterações'}
        </Button>

        {isApiConfigured() && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                Conta (API)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {remoteStatus === 'loading' && (
                <p className="text-muted-foreground">Carregando dados do servidor…</p>
              )}
              {remoteMessage && (
                <p
                  className={
                    remoteStatus === 'error' ? 'text-destructive text-xs' : 'text-muted-foreground'
                  }
                >
                  {remoteMessage}
                </p>
              )}
              {remoteMe && (
                <div className="rounded-md border border-border/60 p-3 space-y-1 font-mono text-xs">
                  <p>
                    <span className="text-muted-foreground">userId:</span> {remoteMe.userId}
                  </p>
                  {remoteMe.email && (
                    <p>
                      <span className="text-muted-foreground">email:</span> {remoteMe.email}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">perfil na API:</span>{' '}
                    {remoteMe.profile
                      ? remoteMe.profile.displayName ?? '(sem nome)'
                      : 'nenhum registro em profiles'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <h2 className="text-lg font-display font-bold pt-2">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">Dias seguidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Dumbbell className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{totalSessions}</p>
              <p className="text-xs text-muted-foreground">Treinos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{(totalVolume / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">Volume total (kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{prs.length}</p>
              <p className="text-xs text-muted-foreground">PRs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
