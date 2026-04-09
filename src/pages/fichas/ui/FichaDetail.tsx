import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, GripVertical, X } from 'lucide-react';
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
import { getPlans, updatePlan } from '@/shared/lib/storage';
import { EXERCISES } from '@/entities/workout/api/exercises';
import type {
  WorkoutPlan,
  WorkoutDay,
  PlanExercise,
  Technique,
  MuscleGroup,
} from '@/entities/workout/model/workout';
import { TECHNIQUE_LABELS, MUSCLE_GROUP_LABELS } from '@/entities/workout/model/workout';
import { cn } from '@/shared/lib/utils';

export default function FichaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [addingToDay, setAddingToDay] = useState<string | null>(null);
  const [newDayName, setNewDayName] = useState('');
  const [showNewDay, setShowNewDay] = useState(false);
  const [filterMuscle, setFilterMuscle] = useState<string>('all');
  const [searchEx, setSearchEx] = useState('');

  useEffect(() => {
    const p = getPlans().find((x) => x.id === id);
    if (p) setPlan(p);
    else navigate('/fichas');
  }, [id, navigate]);

  if (!plan) return null;

  const save = (updated: WorkoutPlan) => {
    setPlan(updated);
    updatePlan(updated);
  };

  const addDay = () => {
    if (!newDayName.trim()) return;
    const day: WorkoutDay = { id: `day-${Date.now()}`, name: newDayName, exercises: [] };
    save({ ...plan, days: [...plan.days, day] });
    setNewDayName('');
    setShowNewDay(false);
  };

  const removeDay = (dayId: string) => {
    save({ ...plan, days: plan.days.filter((d) => d.id !== dayId) });
  };

  const addExercise = (dayId: string, exerciseId: string) => {
    const ex = EXERCISES.find((e) => e.id === exerciseId);
    if (!ex) return;
    const pe: PlanExercise = {
      id: `pe-${Date.now()}`,
      exerciseId,
      sets: 3,
      repsMin: 8,
      repsMax: 12,
      technique: 'normal',
      restSeconds: 90,
      order: plan.days.find((d) => d.id === dayId)?.exercises.length || 0,
    };
    const days = plan.days.map((d) =>
      d.id === dayId ? { ...d, exercises: [...d.exercises, pe] } : d
    );
    save({ ...plan, days });
    setAddingToDay(null);
  };

  const removeExercise = (dayId: string, peId: string) => {
    const days = plan.days.map((d) =>
      d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== peId) } : d
    );
    save({ ...plan, days });
  };

  const updateExercise = (dayId: string, peId: string, updates: Partial<PlanExercise>) => {
    const days = plan.days.map((d) =>
      d.id === dayId
        ? { ...d, exercises: d.exercises.map((e) => (e.id === peId ? { ...e, ...updates } : e)) }
        : d
    );
    save({ ...plan, days });
  };

  const filteredExercises = EXERCISES.filter((e) => {
    if (filterMuscle !== 'all' && !e.muscleGroups.includes(filterMuscle as MuscleGroup))
      return false;
    if (searchEx && !e.name.toLowerCase().includes(searchEx.toLowerCase())) return false;
    return true;
  });

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
                const ex = EXERCISES.find((e) => e.id === pe.exerciseId);
                return (
                  <Card key={pe.id} className="bg-muted/50">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{ex?.name}</span>
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
                          <Label className="text-xs">Reps</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={pe.repsMin}
                              onChange={(e) =>
                                updateExercise(day.id, pe.id, { repsMin: +e.target.value })
                              }
                              className="h-8 text-sm w-full"
                            />
                            <span className="text-xs text-muted-foreground">-</span>
                            <Input
                              type="number"
                              value={pe.repsMax}
                              onChange={(e) =>
                                updateExercise(day.id, pe.id, { repsMax: +e.target.value })
                              }
                              className="h-8 text-sm w-full"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Carga</Label>
                          <Input
                            type="number"
                            value={pe.baseLoad || ''}
                            onChange={(e) =>
                              updateExercise(day.id, pe.id, { baseLoad: +e.target.value })
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
                          onValueChange={(v) =>
                            updateExercise(day.id, pe.id, { technique: v as Technique })
                          }
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
            <Button className="w-full" onClick={addDay}>
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
