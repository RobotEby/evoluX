import { useState, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { getSessions } from '@/shared/lib/storage';
import type { WorkoutSession } from '@/entities/workout/model/workout';

export default function Historico() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    setSessions(getSessions().sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  if (selectedSession) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <button
          onClick={() => setSelectedSession(null)}
          className="text-sm text-primary font-medium"
        >
          ← Voltar
        </button>
        <h1 className="text-xl font-display font-bold">{selectedSession.dayName}</h1>
        <p className="text-sm text-muted-foreground">
          {selectedSession.date} · {selectedSession.duration} min
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">
                {(selectedSession.totalVolume / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-muted-foreground">Volume (kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">
                {selectedSession.exercises.reduce((s, e) => s + e.sets.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Séries</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {selectedSession.exercises.map((ex, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{ex.exerciseName}</p>
                  {ex.skipped && <Badge variant="secondary">Pulado</Badge>}
                </div>
                {ex.sets.map((set, j) => (
                  <div key={j} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Série {set.setNumber}</span>
                    <div className="flex items-center gap-2">
                      <span>
                        {set.weight}kg × {set.reps}
                      </span>
                      {set.isPersonalRecord && (
                        <Badge className="bg-warning text-warning-foreground text-[10px]">PR</Badge>
                      )}
                      {set.clusters && (
                        <span className="text-xs text-muted-foreground">
                          ({set.clusters.join('+')})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {ex.notes && <p className="text-xs text-muted-foreground italic">📝 {ex.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Calendar className="h-6 w-6 text-primary" />
        Histórico
      </h1>

      {sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum treino registrado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((sess) => (
            <Card
              key={sess.id}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setSelectedSession(sess)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{sess.dayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {sess.date} · {sess.duration} min · {(sess.totalVolume / 1000).toFixed(1)}k kg
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
