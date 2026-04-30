import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, GripVertical, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { Label } from '@/shared/ui/ui/label';
import { Input } from '@/shared/ui/ui/input';
import { Badge } from '@/shared/ui/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/ui/accordion';
import { routineService, exerciseService } from '@/entities/workout/api';
import { mapRoutineToPlan, mapExerciseResponseToDomain } from '@/entities/workout/api';
import type {
  WorkoutPlan,
  WorkoutDay,
  PlanExercise,
  Technique,
  Exercise,
  MuscleGroup,
} from '@/entities/workout/model/workout';
import { TECHNIQUE_LABELS, MUSCLE_GROUP_LABELS } from '@/entities/workout/model/workout';

export default function FichaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercisesCatalog, setExercisesCatalog] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToDay, setAddingToDay] = useState<string | null>(null);
  const [newDayName, setNewDayName] = useState('');
  const [showNewDay, setShowNewDay] = useState(false);
  const [filterMuscle, setFilterMuscle] = useState<string>('all');
  const [searchEx, setSearchEx] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/fichas');
      return;
    }
    Promise.all([routineService.getById(id), exerciseService.list()])
      .then(([routine, exercises]) => {
        setPlan(mapRoutineToPlan(routine));
        setExercisesCatalog(exercises.map(mapExerciseResponseToDomain));
      })
      .catch(() => navigate('/fichas'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const reloadPlan = async () => {
    if (!id) return;
    try {
      const routine = await routineService.getById(id);
      setPlan(mapRoutineToPlan(routine));
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) return null;

  const addDay = async () => {
    if (!newDayName.trim() || !id) return;
    setSaving(true);
    try {
      const dayNumber = plan.days.length + 1;
      await routineService.addDay(id, { dayNumber, name: newDayName });
      await reloadPlan();
      setNewDayName('');
      setShowNewDay(false);
    } catch {
      // fallback
    } finally {
      setSaving(false);
    }
  };

  const removeDay = async (dayId: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await routineService.removeDay(id, dayId);
      await reloadPlan();
    } catch {
      // fallback
    } finally {
      setSaving(false);
    }
  };

  const addExercise = async (dayId: string, exerciseId: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await routineService.addExercise(id, dayId, {
        exerciseId,
        sets: 3,
        repsTarget: 10,
        restSeconds: 90,
        durationSeconds: 0,
        weightTargetKg: 0,
      });
      await reloadPlan();
      setAddingToDay(null);
    } catch {
      // fallback
    } finally {
      setSaving(false);
    }
  };

  const removeExercise = async (dayId: string, exerciseId: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await routineService.removeExercise(id, dayId, exerciseId);
      await reloadPlan();
    } catch {
      // fallback
    } finally {
      setSaving(false);
    }
  };

  const updateExercise = async (
    dayId: string,
    peId: string,
    updates: { sets?: number; repsTarget?: number; restSeconds?: number; weightTargetKg?: number }
  ) => {
    if (!id) return;
    // Finds current exercise to preserve fields
    const day = plan.days.find((d) => d.id === dayId);
    const pe = day?.exercises.find((e) => e.id === peId);
    if (!pe) return;
    try {
      await routineService.updateExercise(id, dayId, peId, {
        exerciseId: pe.exerciseId,
        sets: updates.sets ?? pe.sets,
        repsTarget: updates.repsTarget ?? pe.repsMax,
        restSeconds: updates.restSeconds ?? pe.restSeconds,
        durationSeconds: 0,
        weightTargetKg: updates.weightTargetKg ?? pe.baseLoad ?? 0,
      });
      await reloadPlan();
    } catch {
      // fallback
    }
  };

  // ════════════════ Filtro de exercícios ════════════════
  const filteredExercises = exercisesCatalog.filter((e) => {
    if (filterMuscle !== 'all' && !e.muscleGroups.includes(filterMuscle as MuscleGroup))
      return false;
    if (searchEx && !e.name.toLowerCase().includes(searchEx.toLowerCase())) return false;
    return true;
  });

  if (saving) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/fichas')}
          className="touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-display font-bold flex-1">{plan.name}</h1>
      </div>

      <Accordion type="multiple" defaultValue={plan.days.map((d) => d.id)} className="space-y-3">
        {plan.days.map((day) => (
          <AccordionItem key={day.id} value={day.id} className="border rounded-lg bg-card">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{day.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {day.exercises.length} exercícios
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {day.exercises.map((pe) => {
                const ex = exercisesCatalog.find((e) => e.id === pe.exerciseId);
                return (
                  <Card key={pe.id} className="bg-muted/50">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{ex?.name ?? pe.exerciseId}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeExercise(day.id, pe.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Séries</Label>
                          <Input
                            type="number"
                            value={pe.sets}
                            onChange={(e) =>
                              updateExercise(day.id, pe.id, { sets: +e.target.value })
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Reps Alvo</Label>
                          <Input
                            type="number"
                            value={pe.repsMax}
                            onChange={(e) =>
                              updateExercise(day.id, pe.id, { repsTarget: +e.target.value })
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Carga</Label>
                          <Input
                            type="number"
                            value={pe.baseLoad || ''}
                            onChange={(e) =>
                              updateExercise(day.id, pe.id, { weightTargetKg: +e.target.value })
                            }
                            className="h-8 text-sm"
                            placeholder="kg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Descanso</Label>
                          <Input
                            type="number"
                            value={pe.restSeconds}
                            onChange={(e) =>
                              updateExercise(day.id, pe.id, { restSeconds: +e.target.value })
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Técnica</Label>
                        <Select
                          value={pe.technique}
                          onValueChange={(v) => {
                            // técnica é local-only, não mapeada na API atual
                            // mas mantemos o UI para futura integração
                          }}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TECHNIQUE_LABELS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              <Button
                variant="outline"
                className="w-full touch-target"
                onClick={() => {
                  setAddingToDay(day.id);
                  setSearchEx('');
                  setFilterMuscle('all');
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Exercício
              </Button>
              <Button
                variant="ghost"
                className="w-full text-destructive/60 hover:text-destructive"
                onClick={() => removeDay(day.id)}
              >
                Remover dia
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button variant="outline" className="w-full touch-target" onClick={() => setShowNewDay(true)}>
        <Plus className="h-4 w-4 mr-1" /> Adicionar Dia
      </Button>

      {/* New Day Sheet */}
      <Sheet open={showNewDay} onOpenChange={setShowNewDay}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Novo Dia</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Nome do dia</Label>
              <Input
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                placeholder="Ex: Peito e Tríceps"
              />
            </div>
            <Button className="w-full" onClick={addDay} disabled={!newDayName.trim()}>
              Adicionar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Exercise Sheet */}
      <Sheet open={!!addingToDay} onOpenChange={() => setAddingToDay(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Adicionar Exercício</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <Input
              value={searchEx}
              onChange={(e) => setSearchEx(e.target.value)}
              placeholder="Buscar exercício..."
            />
            <Select value={filterMuscle} onValueChange={setFilterMuscle}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por músculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(MUSCLE_GROUP_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              {filteredExercises.map((ex) => (
                <Card
                  key={ex.id}
                  className="cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => addingToDay && addExercise(addingToDay, ex.id)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{ex.name}</p>
                    <div className="flex gap-1 mt-1">
                      {ex.muscleGroups.map((mg) => (
                        <Badge key={mg} variant="secondary" className="text-[10px]">
                          {MUSCLE_GROUP_LABELS[mg]}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}