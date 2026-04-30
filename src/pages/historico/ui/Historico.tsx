import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Calendar, Loader2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { sessionService } from '@/entities/workout/api';
import { mapSessionToWorkoutSession } from '@/entities/workout/api';
import type { WorkoutSession } from '@/entities/workout/model/workout';

export default function Historico() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    sessionService
      .list(0, 50)
      .then((list) => list.map(mapSessionToWorkoutSession))
      .then((mapped) => mapped.filter((s) => s.completed))
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByMonth(sessions);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <History className="h-6 w-6 text-primary" />
        Histórico
      </h1>

      {sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <History className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Nenhuma sessão registrada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthSessions]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {month}
              </h2>
              <div className="space-y-2">
                {monthSessions.map((s) => (
                  <Card
                    key={s.id}
                    className="hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() =>
                      setExpanded(expanded === s.id ? null : s.id)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{s.dayName || 'Treino'}</p>
                          <p className="text-sm text-muted-foreground">
                            {s.date} · {s.duration}min · {(s.totalVolume / 1000).toFixed(1)}k kg
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {s.exercises.some((ex) =>
                            ex.sets.some((set) => set.isPersonalRecord)
                          ) && (
                            <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                              PR
                            </Badge>
                          )}
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              expanded === s.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {expanded === s.id && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          {s.exercises.map((ex, i) => (
                            <div key={i} className="text-sm">
                              <p className="font-medium text-xs text-muted-foreground mb-1">
                                {ex.exerciseName}
                              </p>
                              {ex.sets.map((set, j) => (
                                <div key={j} className="flex items-center justify-between pl-3">
                                  <span className="text-muted-foreground">
                                    Série {set.setNumber}
                                  </span>
                                  <span className="font-mono tabular-nums">
                                    {set.weight}kg × {set.reps}
                                    {set.isPersonalRecord && (
                                      <span className="ml-1 text-warning text-[10px]">PR</span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByMonth(sessions: WorkoutSession[]): Record<string, WorkoutSession[]> {
  const months: Record<string, WorkoutSession[]> = {};
  for (const s of sessions) {
    const date = new Date(s.date + 'T00:00:00');
    const key = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!months[key]) months[key] = [];
    months[key].push(s);
  }
  return months;
}