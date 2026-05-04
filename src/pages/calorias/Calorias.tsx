import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Apple,
  Coffee,
  Sun,
  Cookie,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { Input } from '@/shared/ui/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/ui/sheet';
import { getFoodLogs, addFoodLog, deleteFoodLog, getNutritionGoals } from '@/shared/lib/storage';
import type { FoodLog, MealType, NutritionGoals } from '@/entities/workout/api/nutrition';
import { MEAL_LABELS } from '@/entities/workout/api/nutrition';
import { FOOD_DATABASE } from '@/entities/workout/api/foods';

const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  cafe: <Coffee className="h-4 w-4" />,
  almoco: <Sun className="h-4 w-4" />,
  lanche: <Cookie className="h-4 w-4" />,
  jantar: <Moon className="h-4 w-4" />,
};

const MEAL_ORDER: MealType[] = ['cafe', 'almoco', 'lanche', 'jantar'];

function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const pct = Math.min(consumed / goal, 1.2);
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  const remaining = Math.max(goal - consumed, 0);
  const overBudget = consumed > goal;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={overBudget ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: Math.max(offset, 0) }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 90 90)"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-display font-bold">{consumed}</p>
        <p className="text-xs text-muted-foreground">
          {overBudget ? `+${consumed - goal} excedido` : `${remaining} restantes`}
        </p>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value.toFixed(0)}g / {goal}g
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function AddFoodSheet({
  mealType,
  date,
  onAdded,
}: {
  mealType: MealType;
  date: string;
  onAdded: () => void;
}) {
  const [search, setSearch] = useState('');
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return FOOD_DATABASE;
    const q = search.toLowerCase();
    return FOOD_DATABASE.filter((f) => f.name.toLowerCase().includes(q));
  }, [search]);

  const food = FOOD_DATABASE.find((f) => f.id === selected);

  const handleAdd = () => {
    if (!food) return;
    addFoodLog({
      id: `fl-${Date.now()}`,
      foodId: food.id,
      foodName: food.name,
      quantity: qty,
      calories: Math.round(food.calories * qty),
      protein: Math.round(food.protein * qty * 10) / 10,
      carbs: Math.round(food.carbs * qty * 10) / 10,
      fat: Math.round(food.fat * qty * 10) / 10,
      date,
      mealType,
    });
    setSelected(null);
    setQty(1);
    setSearch('');
    setOpen(false);
    onAdded();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Adicionar a {MEAL_LABELS[mealType]}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 overflow-y-auto max-h-[calc(85vh-120px)]">
          {!selected ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alimento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-1">
                {filtered.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.servingSize}
                        {f.servingUnit} · P:{f.protein}g C:{f.carbs}g G:{f.fat}g
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">{f.calories} kcal</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhum alimento encontrado
                  </p>
                )}
              </div>
            </>
          ) : food ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-lg font-semibold">{food.name}</p>
                <p className="text-sm text-muted-foreground">
                  {food.servingSize}
                  {food.servingUnit} por porção
                </p>
              </div>
              <div className="flex items-center justify-center gap-6">
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQty((q) => Math.max(0.5, q - 0.5))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </motion.div>
                <span className="text-3xl font-display font-bold w-16 text-center">{qty}</span>
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQty((q) => q + 0.5)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              <Card>
                <CardContent className="p-4 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      {Math.round(food.calories * qty)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{(food.protein * qty).toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">Proteína</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{(food.carbs * qty).toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">Carbos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{(food.fat * qty).toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">Gordura</p>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                  Voltar
                </Button>
                <Button className="flex-1" onClick={handleAdd}>
                  Adicionar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Calorias() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [goals, setGoals] = useState<NutritionGoals>({
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 70,
  });

  const reload = () => {
    setLogs(getFoodLogs(date));
    setGoals(getNutritionGoals());
  };

  useEffect(() => {
    reload();
  }, [date]);

  const totals = useMemo(
    () =>
      logs.reduce(
        (acc, l) => ({
          calories: acc.calories + l.calories,
          protein: acc.protein + l.protein,
          carbs: acc.carbs + l.carbs,
          fat: acc.fat + l.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [logs]
  );

  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };
  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    const today = new Date().toISOString().split('T')[0];
    if (d.toISOString().split('T')[0] <= today) setDate(d.toISOString().split('T')[0]);
  };

  const isToday = date === new Date().toISOString().split('T')[0];
  const displayDate = new Date(date + 'T12:00:00');
  const dateLabel = isToday
    ? 'Hoje'
    : displayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const handleDelete = (logId: string) => {
    deleteFoodLog(logId);
    reload();
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Apple className="h-6 w-6 text-primary" />
          Calorias
        </h1>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={prevDay}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium w-24 text-center">{dateLabel}</span>
        <Button variant="ghost" size="icon" onClick={nextDay} disabled={isToday}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex justify-center">
        <CalorieRing consumed={totals.calories} goal={goals.calories} />
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <MacroBar
            label="Proteína"
            value={totals.protein}
            goal={goals.protein}
            color="hsl(199, 89%, 48%)"
          />
          <MacroBar
            label="Carboidratos"
            value={totals.carbs}
            goal={goals.carbs}
            color="hsl(45, 93%, 47%)"
          />
          <MacroBar
            label="Gordura"
            value={totals.fat}
            goal={goals.fat}
            color="hsl(340, 82%, 52%)"
          />
        </CardContent>
      </Card>

      {MEAL_ORDER.map((meal) => {
        const mealLogs = logs.filter((l) => l.mealType === meal);
        const mealCals = mealLogs.reduce((s, l) => s + l.calories, 0);
        return (
          <Card key={meal}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {MEAL_ICONS[meal]}
                  <span className="font-semibold text-sm">{MEAL_LABELS[meal]}</span>
                  {mealCals > 0 && (
                    <span className="text-xs text-muted-foreground">{mealCals} kcal</span>
                  )}
                </div>
                <AddFoodSheet mealType={meal} date={date} onAdded={reload} />
              </div>
              <AnimatePresence>
                {mealLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between py-2 border-t border-border/50"
                  >
                    <div>
                      <p className="text-sm">{log.foodName}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.quantity} porção · P:{log.protein.toFixed(0)}g C:{log.carbs.toFixed(0)}
                        g G:{log.fat.toFixed(0)}g
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{log.calories}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDelete(log.id)}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {mealLogs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Nenhum alimento registrado
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
