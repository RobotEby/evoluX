import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Input } from '@/shared/ui/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/ui/select';
import { exerciseService } from '@/entities/workout/api';
import { mapExerciseResponseToDomain } from '@/entities/workout/api';
import type { Exercise } from '@/entities/workout/model/workout';
import { MUSCLE_GROUP_LABELS, type MuscleGroup } from '@/entities/workout/model/workout';

export default function Biblioteca() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');

  useEffect(() => {
    exerciseService
      .list()
      .then((list) => list.map(mapExerciseResponseToDomain))
      .then(setExercises)
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, []);

  const equipments = [...new Set(exercises.map((e) => e.equipment).filter(Boolean))] as string[];

  const filtered = exercises.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterMuscle !== 'all' && !e.muscleGroups.includes(filterMuscle as MuscleGroup))
      return false;
    if (filterEquipment !== 'all' && e.equipment !== filterEquipment) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        Biblioteca de Exercícios
      </h1>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar exercícios..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterMuscle} onValueChange={setFilterMuscle}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Músculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos músculos</SelectItem>
              {Object.entries(MUSCLE_GROUP_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterEquipment} onValueChange={setFilterEquipment}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Equipamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {equipments.map((eq) => (
                <SelectItem key={eq} value={eq}>
                  {eq}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((ex) => (
          <Card
            key={ex.id}
            className="hover:border-primary/30 transition-colors"
          >
            <CardContent className="p-4 space-y-1.5">
              <p className="font-medium">{ex.name}</p>
              <div className="flex flex-wrap gap-1">
                {ex.muscleGroups.map((mg) => (
                  <Badge key={mg} variant="secondary" className="text-[10px]">
                    {MUSCLE_GROUP_LABELS[mg]}
                  </Badge>
                ))}
                {ex.equipment && (
                  <Badge variant="outline" className="text-[10px]">
                    {ex.equipment}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum exercício encontrado.</p>
        </div>
      )}
    </div>
  );
}