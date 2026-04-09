import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { Badge } from '@/shared/ui/ui/badge';
import { getPlans } from '@/shared/lib/storage';
import type { WorkoutPlan } from '@/entities/workout/model/workout';
import { DIVISION_LABELS } from '@/entities/workout/model/workout';
export default function Treino() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);

  useEffect(() => {
    setPlans(getPlans());
  }, []);

  const startWorkout = (planId: string, dayId: string) => {
    navigate(`/em-treino/${planId}/${dayId}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Iniciar Treino</h1>
      <p className="text-muted-foreground">Selecione o treino do dia:</p>

      {plans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-muted-foreground">Crie uma ficha primeiro.</p>
            <Button variant="outline" onClick={() => navigate('/fichas')}>
              Ir para Fichas
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm">{plan.name}</h2>
                <Badge variant="secondary" className="text-xs">
                  {DIVISION_LABELS[plan.divisionType]}
                </Badge>
              </div>
              {plan.days.map((day) => (
                <Card
                  key={day.id}
                  className="cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => startWorkout(plan.id, day.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{day.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.exercises.length} exercícios
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="touch-target">
                        <Play className="h-4 w-4 mr-1" /> Iniciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
