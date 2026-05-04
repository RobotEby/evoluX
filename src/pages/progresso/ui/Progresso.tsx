import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Flame, BarChart3, User, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/shared/ui/ui/badge';
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
import { getPRs, getSessions, getStreak } from '@/shared/lib/storage';
import { MOCK_VOLUME_DATA, MOCK_1RM_DATA } from '@/entities/workout/api/mock-data';
import type { PersonalRecord } from '@/entities/workout/model/workout';
import { MUSCLE_GROUP_LABELS, type MuscleGroup } from '@/entities/workout/model/workout';

export default function Progresso() {
  const navigate = useNavigate();
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [weeklyFrequency, setWeeklyFrequency] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    setPrs(getPRs());
    setStreak(getStreak());
    const sessions = getSessions();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    setWeeklyFrequency(sessions.filter((s) => new Date(s.date) >= weekAgo && s.completed).length);
    setUnlockedCount(checkAndUnlockAchievements().filter((a) => a.unlockedAt).length);
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
          <TabsTrigger value="1rm" className="flex-1">
            1RM Estimado
          </TabsTrigger>
          <TabsTrigger value="volume" className="flex-1">
            Volume
          </TabsTrigger>
          <TabsTrigger value="muscles" className="flex-1">
            Músculos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="1rm">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">1RM Estimado (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={MOCK_1RM_DATA}>
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
                  <Line
                    type="monotone"
                    dataKey="supino"
                    stroke="hsl(199, 89%, 48%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Supino"
                  />
                  <Line
                    type="monotone"
                    dataKey="agachamento"
                    stroke="hsl(168, 84%, 40%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Agachamento"
                  />
                  <Line
                    type="monotone"
                    dataKey="terra"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Terra"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Volume por Sessão (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={MOCK_VOLUME_DATA}>
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
          {prs.map((pr) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
