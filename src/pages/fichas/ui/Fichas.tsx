import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { Badge } from '@/shared/ui/ui/badge';
import { Input } from '@/shared/ui/ui/input';
import { Label } from '@/shared/ui/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/ui/sheet';
import { routineService } from '@/entities/workout/api';
import { mapRoutineToPlan } from '@/entities/workout/api';
import type { WorkoutPlan, DivisionType } from '@/entities/workout/model/workout';
import { DIVISION_LABELS } from '@/entities/workout/model/workout';

export default function Fichas() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDivision, setNewDivision] = useState<DivisionType>('ppl');
  const [newDays, setNewDays] = useState(4);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    routineService
      .list()
      .then((routines) => routines.map(mapRoutineToPlan))
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const createPlan = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await routineService.create({ name: newName, goal: 'hipertrofia' });
      // Recarrega a lista
      const routines = await routineService.list();
      setPlans(routines.map(mapRoutineToPlan));
      setShowNew(false);
      setNewName('');

      // Navega para a nova rotina (última da lista)
      const last = routines[routines.length - 1];
      if (last) {
        navigate(`/fichas/${last.id}`);
      }
    } catch {
      // fallback silencioso
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await routineService.remove(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
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

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Minhas Fichas</h1>
        <Sheet open={showNew} onOpenChange={setShowNew}>
          <SheetTrigger asChild>
            <Button className="touch-target">
              <Plus className="h-4 w-4 mr-1" /> Nova Ficha
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nova Ficha de Treino</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: PPL Hipertrofia"
                />
              </div>
              <div className="space-y-2">
                <Label>Divisão</Label>
                <Select
                  value={newDivision}
                  onValueChange={(v) => setNewDivision(v as DivisionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIVISION_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dias por semana</Label>
                <Select value={String(newDays)} onValueChange={(v) => setNewDays(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}x/semana
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full touch-target"
                onClick={createPlan}
                disabled={creating || !newName.trim()}
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Criar Ficha
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {plans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-muted-foreground">Nenhuma ficha criada ainda.</p>
            <Button variant="outline" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4 mr-1" /> Criar primeira ficha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/fichas/${plan.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{plan.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {DIVISION_LABELS[plan.divisionType]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.days.length} dias · {plan.daysPerWeek}x/semana
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plan.id)}
                      className="text-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}