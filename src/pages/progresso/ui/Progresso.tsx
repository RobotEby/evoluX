import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Flame, BarChart3, User, Scale, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { useNavigate } from 'react-router-dom';
import { checkAndUnlockAchievements } from '@/shared/lib/achievements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  sessionService,
  recordService,
  mapRecordToPR,
  calculateStreak,
} from '@/entities/workout/api';
import type { PersonalRecord } from '@/entities/workout/model/workout';
import type { SessionResponse } from '@/entities/workout/api/sessionService';

interface VolumePoint {
  date: string;
  volume: number;
}

interface OneRMPoint {
  date: string;
  [exerciseName: string]: number | string;
}

export default function Progresso() {
  const navigate = useNavigate();
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [weeklyFrequency, setWeeklyFrequency] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [volumeData, setVolumeData] = useState<VolumePoint[]>([]);
  const [oneRMData, setOneRMData] = useState<OneRMPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([sessionService.list(0, 90), recordService.list()])
      .then(([sessions, records]) => {
        setPrs(records.map(mapRecordToPR));

        const completed = sessions.filter((s) => s.status === 'COMPLETED');
        const completedDates = completed.map((s) => s.startedAt?.split('T')[0] ?? '');
        setStreak(calculateStreak(completedDates));

        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        setWeeklyFrequency(
          completed.filter((s) => new Date(s.startedAt || '') >= weekAgo).length
        );

        setVolumeData(buildVolumeData(completed));
        setOneRMData(build1RMData(records));
        setUnlockedCount(checkAndUnlockAchievements().filter((a) => a.unlockedAt).length);
      })
      .catch(() => {
        setPrs([]);
        setVolumeData([]);
        setOneRMData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const muscleVolume: { muscle: string; volume: number }[] = [
    { muscle: 'Peito', volume: 18 },
    { muscle: 'Costas', volume: 20 },
    { muscle: 'Ombros', volume: 14 },
    { muscle: 'Bíceps', volume: 8 },
    { muscle: 'Tríceps', volume: 10 },
    { muscle: 'Quadríceps', volume: 16 },
    { muscle: 'Posteriores', volume: 10 },
    { muscle: 'Panturrilhas', volume: 4 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Progresso
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/corpo')} className="gap-1">
            <Scale className="h-4 w-4" /> Corpo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/conquistas')}
            className="gap-1"
          >
            <Trophy className="h-4 w-4" /> {unlockedCount} 🏆
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/perfil')} className="gap-1">
            <User className="h-4 w-4" /> Perfil
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-display font-bold">{streak}</p>
            <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <BarChart3 className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-display font-bold">{weeklyFrequency}</p>
            <p className="text-[10px] text-muted-foreground">Treinos/semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-display font-bold">{prs.length}</p>
            <p className="text-[10px] text-muted-foreground">Records</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="1rm" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="1rm" className="flex-1">1RM Estimado</TabsTrigger>
          <TabsTrigger value="volume" className="flex-1">Volume</TabsTrigger>
          <TabsTrigger value="muscles" className="flex-1">Músculos</TabsTrigger>
        </TabsList>

        <TabsContent value="1rm">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">1RM Estimado (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              {oneRMData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={oneRMData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    {getExerciseNames(oneRMData).map((name, i) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name={name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  Nenhum record registrado ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Volume por Sessão (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              {volumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="volume"
                      fill="hsl(199, 89%, 48%)"
                      radius={[4, 4, 0, 0]}
                      name="Volume"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  Nenhuma sessão registrada ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="muscles">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Volume Semanal por Músculo (séries)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={muscleVolume} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    dataKey="muscle"
                    type="category"
                    fontSize={11}
                    stroke="hsl(var(--muted-foreground))"
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="volume"
                    fill="hsl(168, 84%, 40%)"
                    radius={[0, 4, 4, 0]}
                    name="Séries"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            Records Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {prs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">
              Nenhum record registrado ainda.
            </p>
          ) : (
            prs.map((pr) => (
              <div
                key={pr.exerciseId}
                className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
              >
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const LINE_COLORS = [
  'hsl(199, 89%, 48%)',
  'hsl(168, 84%, 40%)',
  'hsl(38, 92%, 50%)',
  'hsl(271, 70%, 50%)',
  'hsl(348, 83%, 47%)',
];

function buildVolumeData(sessions: SessionResponse[]): VolumePoint[] {
  const last14 = new Date();
  last14.setDate(last14.getDate() - 14);
  return sessions
    .filter((s) => s.status === 'COMPLETED' && new Date(s.startedAt || '') >= last14)
    .map((s) => ({
      date: formatDateShort(s.startedAt || ''),
      volume: s.totalVolumeKg || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function formatDateShort(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function build1RMData(
  records: Array<{ exerciseName?: string; value: number; achievedAt: string; prType: string }>
): OneRMPoint[] {
  const byDate = new Map<string, Record<string, number>>();
  for (const r of records) {
    if (r.prType !== 'ONE_RM' || !r.exerciseName) continue;
    const date = formatDateShort(r.achievedAt);
    if (!byDate.has(date)) byDate.set(date, {});
    byDate.get(date)![r.exerciseName] = r.value;
  }
  return Array.from(byDate.entries())
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getExerciseNames(data: OneRMPoint[]): string[] {
  const names = new Set<string>();
  for (const point of data) {
    for (const key of Object.keys(point)) {
      if (key !== 'date') names.add(key);
    }
  }
  return Array.from(names).slice(0, 5);
}