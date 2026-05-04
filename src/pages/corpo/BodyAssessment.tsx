import { useState, useEffect, useRef } from 'react';
import { Scale, Ruler, Camera, Plus, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { Input } from '@/shared/ui/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getBodyWeightLogs,
  addBodyWeightLog,
  getBodyMeasurements,
  addBodyMeasurement,
  getProgressPhotos,
  addProgressPhoto,
  deleteProgressPhoto,
} from '@/shared/lib/storage';
import type {
  BodyWeightLog,
  BodyMeasurement,
  BodyMeasurements,
  ProgressPhoto,
} from '@/entities/workout/api/body';

const MEASUREMENT_FIELDS: { key: keyof BodyMeasurements; label: string }[] = [
  { key: 'peito', label: 'Peito' },
  { key: 'cintura', label: 'Cintura' },
  { key: 'quadril', label: 'Quadril' },
  { key: 'bracoD', label: 'Braço D' },
  { key: 'bracoE', label: 'Braço E' },
  { key: 'coxaD', label: 'Coxa D' },
  { key: 'coxaE', label: 'Coxa E' },
  { key: 'panturrilha', label: 'Panturrilha' },
];

export default function BodyAssessment() {
  const [weightLogs, setWeightLogs] = useState<BodyWeightLog[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showMeasForm, setShowMeasForm] = useState(false);
  const [measForm, setMeasForm] = useState<BodyMeasurements>({
    cintura: 0,
    peito: 0,
    bracoD: 0,
    bracoE: 0,
    coxaD: 0,
    coxaE: 0,
    quadril: 0,
    panturrilha: 0,
  });
  const [photoLabel, setPhotoLabel] = useState<'frente' | 'costas' | 'lado'>('frente');
  const [viewPhoto, setViewPhoto] = useState<ProgressPhoto | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWeightLogs(getBodyWeightLogs());
    setMeasurements(getBodyMeasurements());
    setPhotos(getProgressPhotos());
  }, []);

  const handleAddWeight = () => {
    const w = parseFloat(newWeight);
    if (!w || w <= 0) return;
    const log: BodyWeightLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      weight: w,
    };
    addBodyWeightLog(log);
    setWeightLogs(getBodyWeightLogs());
    setNewWeight('');
    setShowWeightForm(false);
  };

  const handleAddMeasurement = () => {
    const m: BodyMeasurement = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      measurements: { ...measForm },
    };
    addBodyMeasurement(m);
    setMeasurements(getBodyMeasurements());
    setMeasForm({
      cintura: 0,
      peito: 0,
      bracoD: 0,
      bracoE: 0,
      coxaD: 0,
      coxaE: 0,
      quadril: 0,
      panturrilha: 0,
    });
    setShowMeasForm(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const photo: ProgressPhoto = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        imageDataUrl: reader.result as string,
        label: photoLabel,
      };
      addProgressPhoto(photo);
      setPhotos(getProgressPhotos());
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePhoto = (id: string) => {
    deleteProgressPhoto(id);
    setPhotos(getProgressPhotos());
    setViewPhoto(null);
  };

  const latestWeight = weightLogs[weightLogs.length - 1];
  const firstWeight = weightLogs[0];
  const weightDelta =
    latestWeight && firstWeight ? (latestWeight.weight - firstWeight.weight).toFixed(1) : null;

  const chartData = weightLogs.map((l) => ({ date: l.date.slice(5), weight: l.weight }));

  const latestMeas = measurements[measurements.length - 1];
  const firstMeas = measurements[0];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Scale className="h-6 w-6 text-primary" />
        Corpo
      </h1>

      <Tabs defaultValue="peso" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="peso" className="flex-1 gap-1">
            <Scale className="h-4 w-4" /> Peso
          </TabsTrigger>
          <TabsTrigger value="medidas" className="flex-1 gap-1">
            <Ruler className="h-4 w-4" /> Medidas
          </TabsTrigger>
          <TabsTrigger value="fotos" className="flex-1 gap-1">
            <Camera className="h-4 w-4" /> Fotos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peso" className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-display font-bold">{latestWeight?.weight ?? '--'}</p>
                <p className="text-[10px] text-muted-foreground">Atual (kg)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-display font-bold">
                  {weightLogs.length > 0 ? Math.min(...weightLogs.map((l) => l.weight)) : '--'}
                </p>
                <p className="text-[10px] text-muted-foreground">Mínimo (kg)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p
                  className={`text-lg font-display font-bold ${weightDelta && parseFloat(weightDelta) < 0 ? 'text-green-500' : weightDelta && parseFloat(weightDelta) > 0 ? 'text-red-400' : ''}`}
                >
                  {weightDelta ? `${parseFloat(weightDelta) > 0 ? '+' : ''}${weightDelta}` : '--'}
                </p>
                <p className="text-[10px] text-muted-foreground">Delta (kg)</p>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 1 && (
            <Card>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                      domain={['auto', 'auto']}
                    />
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
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Peso"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <AnimatePresence>
            {showWeightForm ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Input
                      type="number"
                      placeholder="Peso em kg"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      step="0.1"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddWeight} className="flex-1">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setShowWeightForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Button onClick={() => setShowWeightForm(true)} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Registrar Peso
              </Button>
            )}
          </AnimatePresence>

          {weightLogs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Histórico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[...weightLogs]
                  .reverse()
                  .slice(0, 10)
                  .map((l) => (
                    <div
                      key={l.id}
                      className="flex justify-between text-sm py-1 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground">{l.date}</span>
                      <span className="font-bold">{l.weight} kg</span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="medidas" className="space-y-4">
          <AnimatePresence>
            {showMeasForm ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Medidas em cm</p>
                    <div className="grid grid-cols-2 gap-3">
                      {MEASUREMENT_FIELDS.map((f) => (
                        <div key={f.key}>
                          <label className="text-xs text-muted-foreground">{f.label}</label>
                          <Input
                            type="number"
                            placeholder="cm"
                            value={measForm[f.key] || ''}
                            onChange={(e) =>
                              setMeasForm((prev) => ({
                                ...prev,
                                [f.key]: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddMeasurement} className="flex-1">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setShowMeasForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Button onClick={() => setShowMeasForm(true)} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Nova Medição
              </Button>
            )}
          </AnimatePresence>

          {latestMeas && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Última Medição — {latestMeas.date}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {MEASUREMENT_FIELDS.map((f) => {
                  const current = latestMeas.measurements[f.key];
                  const first = firstMeas?.measurements[f.key];
                  const delta =
                    firstMeas && measurements.length > 1 ? (current - first).toFixed(1) : null;
                  return (
                    <div
                      key={f.key}
                      className="flex justify-between text-sm py-1 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground">{f.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{current} cm</span>
                        {delta && (
                          <span
                            className={`text-xs ${parseFloat(delta) < 0 ? 'text-green-500' : parseFloat(delta) > 0 ? 'text-red-400' : 'text-muted-foreground'}`}
                          >
                            {parseFloat(delta) > 0 ? '+' : ''}
                            {delta}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {measurements.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Histórico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[...measurements].reverse().map((m) => (
                  <div key={m.id} className="text-sm py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{m.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fotos" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select
              value={photoLabel}
              onValueChange={(v: 'frente' | 'costas' | 'lado') => setPhotoLabel(v)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frente">Frente</SelectItem>
                <SelectItem value="costas">Costas</SelectItem>
                <SelectItem value="lado">Lado</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => fileRef.current?.click()} className="flex-1 gap-2">
              <Camera className="h-4 w-4" /> Tirar/Enviar Foto
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {photos.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                Nenhuma foto ainda. Tire sua primeira foto de progresso!
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <motion.div
                key={p.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="cursor-pointer"
                onClick={() => setViewPhoto(p)}
              >
                <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border relative">
                  <img src={p.imageDataUrl} alt={p.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-[9px] bg-background/80 px-1.5 py-0.5 rounded font-medium">
                    {p.label} · {p.date.slice(5)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <Dialog open={!!viewPhoto} onOpenChange={() => setViewPhoto(null)}>
            <DialogContent className="max-w-lg p-2">
              {viewPhoto && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-sm">
                      {viewPhoto.label} — {viewPhoto.date}
                    </DialogTitle>
                  </DialogHeader>
                  <img
                    src={viewPhoto.imageDataUrl}
                    alt={viewPhoto.label}
                    className="w-full rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePhoto(viewPhoto.id)}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Excluir
                  </Button>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
