import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Minus,
  Timer,
  SkipForward,
  Check,
  Trophy,
  MessageSquare,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/ui/ui/button';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Input } from '@/shared/ui/ui/input';
import { Badge } from '@/shared/ui/ui/badge';
import { Progress } from '@/shared/ui/ui/progress';
import { cn } from '@/shared/lib/utils';
import { routineService, sessionService, recordService } from '@/entities/workout/api';
import { mapRoutineToPlan } from '@/entities/workout/api';
import { EXERCISES } from '@/entities/workout/api/exercises';
import type {
  WorkoutPlan,
  WorkoutDay,
  PlanExercise,
  SetLog,
  ExerciseLog,
  WorkoutSession,
} from '@/entities/workout/model/workout';
import { TECHNIQUE_LABELS } from '@/entities/workout/model/workout';

const MotionButton = motion.create(Button);

const slideVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

const popVariants = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.2, 1], transition: { duration: 0.2 } },
};

export default function EmTreino() {
  const { planId, dayId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [showPR, setShowPR] = useState(false);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [clusters, setClusters] = useState<number[]>([]);
  const [drops, setDrops] = useState<{ weight: number; reps: number }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [startTime] = useState(Date.now());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [muscleRoundSet, setMuscleRoundSet] = useState(0);
  const [isMuscleRoundRest, setIsMuscleRoundRest] = useState(false);
  const [muscleRoundClusters, setMuscleRoundClusters] = useState<number[]>([]);

  useEffect(() => {
    if (!planId || !dayId) {
      navigate('/treino');
      return;
    }
    routineService
      .getById(planId)
      .then((routine) => {
        const p = mapRoutineToPlan(routine);
        const d = p.days.find((x) => x.id === dayId);
        if (!d) {
          navigate('/treino');
          return;
        }
        setPlan(p);
        setDay(d);
        if (d.exercises.length > 0) {
          setWeight(d.exercises[0].baseLoad || 0);
          setReps(d.exercises[0].technique === 'muscle-rounds' ? 6 : d.exercises[0].repsMin);
        }
        return sessionService
          .start({ routineId: planId, routineDayId: dayId })
          .then((s) => setSessionId(s.id));
      })
      .catch(() => navigate('/treino'))
      .finally(() => setLoading(false));
  }, [planId, dayId, navigate]);

  const currentPE = day?.exercises[currentExIndex];
  const currentEx = currentPE ? EXERCISES.find((e) => e.id === currentPE.exerciseId) : null;
  const totalExercises = day?.exercises.length || 0;
  const progress = totalExercises > 0 ? (currentExIndex / totalExercises) * 100 : 0;
  const isMuscleRounds = currentPE?.technique === 'muscle-rounds';

  useEffect(() => {
    if ((isResting || isMuscleRoundRest) && restTime > 0) {
      timerRef.current = setInterval(() => {
        setRestTime((t) => {
          if (t <= 1) {
            setIsResting(false);
            setIsMuscleRoundRest(false);
            if (navigator.vibrate) navigator.vibrate(300);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [isResting, isMuscleRoundRest, restTime]);

  const startRest = useCallback((seconds: number) => {
    setRestTotal(seconds);
    setRestTime(seconds);
    setIsResting(true);
  }, []);

  const skipRest = () => {
    setIsResting(false);
    setIsMuscleRoundRest(false);
    setRestTime(0);
  };

  const calculate1RM = (w: number, r: number) => Math.round(w * (1 + r / 30));

  const sendSetToApi = async (exerciseId: string, repsDone: number, weightKg: number) => {
    if (!sessionId) return;
    try {
      await sessionService.addSet(sessionId, {
        exerciseId,
        setNumber: currentSetIndex + 1,
        repsDone,
        weightKg,
        durationSeconds: 0,
        isCompleted: true,
        isWarmup: false,
      });
    } catch {
      // non-blocking
    }
  };

  const createPRApi = async (exerciseId: string, est1RM: number) => {
    try {
      await recordService.create({
        exerciseId,
        prType: 'ONE_RM',
        value: est1RM,
        unit: 'kg',
        sessionId: sessionId || undefined,
      });
    } catch {
      // non-blocking
    }
  };

  const logMuscleRoundMiniSet = () => {
    if (!currentPE || !currentEx) return;
    const newClusters = [...muscleRoundClusters, 6];
    setMuscleRoundClusters(newClusters);

    if (muscleRoundSet < 5) {
      setMuscleRoundSet((s) => s + 1);
      setRestTotal(10);
      setRestTime(10);
      setIsMuscleRoundRest(true);
    } else {
      const totalReps = 36;
      const setLog: SetLog = {
        setNumber: currentSetIndex + 1,
        reps: totalReps,
        weight,
        technique: 'muscle-rounds',
        clusters: newClusters,
      };

      const est1RM = calculate1RM(weight, totalReps);
      if (est1RM > 0) {
        setLog.isPersonalRecord = true;
        createPRApi(currentPE.exerciseId, est1RM);
        setShowPR(true);
        setTimeout(() => setShowPR(false), 2500);
      }

      sendSetToApi(currentPE.exerciseId, totalReps, weight);

      setExerciseLogs((prev) => {
        const existing = prev.find((e) => e.exerciseId === currentPE.exerciseId);
        if (existing) {
          return prev.map((e) =>
            e.exerciseId === currentPE.exerciseId ? { ...e, sets: [...e.sets, setLog] } : e
          );
        }
        return [
          ...prev,
          {
            exerciseId: currentPE.exerciseId,
            exerciseName: currentEx.name,
            sets: [setLog],
            notes: note || undefined,
          },
        ];
      });

      setMuscleRoundSet(0);
      setMuscleRoundClusters([]);
      if (note) {
        setExerciseLogs((prev) =>
          prev.map((e) => (e.exerciseId === currentPE.exerciseId ? { ...e, notes: note } : e))
        );
        setNote('');
      }
      nextExercise();
    }
  };

  const logSet = () => {
    if (!currentPE || !currentEx) return;

    if (isMuscleRounds) {
      logMuscleRoundMiniSet();
      return;
    }

    const setLog: SetLog = {
      setNumber: currentSetIndex + 1,
      reps,
      weight,
      technique: currentPE.technique,
    };

    if (currentPE.technique === 'rest-pause' && clusters.length > 0) {
      setLog.clusters = [...clusters, reps];
      setLog.reps = clusters.reduce((a, b) => a + b, 0) + reps;
    }

    if (currentPE.technique === 'drop-set' && drops.length > 0) {
      setLog.drops = [...drops, { weight, reps }];
    }

    const est1RM = calculate1RM(weight, setLog.reps);
    if (est1RM > 0 && weight > 0) {
      setLog.isPersonalRecord = true;
      createPRApi(currentPE.exerciseId, est1RM);
      setShowPR(true);
      setTimeout(() => setShowPR(false), 2500);
    }

    sendSetToApi(currentPE.exerciseId, setLog.reps, weight);

    setExerciseLogs((prev) => {
      const existing = prev.find((e) => e.exerciseId === currentPE.exerciseId);
      if (existing) {
        return prev.map((e) =>
          e.exerciseId === currentPE.exerciseId ? { ...e, sets: [...e.sets, setLog] } : e
        );
      }
      return [
        ...prev,
        {
          exerciseId: currentPE.exerciseId,
          exerciseName: currentEx.name,
          sets: [setLog],
          notes: note || undefined,
        },
      ];
    });

    setClusters([]);
    setDrops([]);

    if (currentSetIndex < currentPE.sets - 1) {
      setCurrentSetIndex((s) => s + 1);
      startRest(currentPE.restSeconds);
    } else {
      if (note) {
        setExerciseLogs((prev) =>
          prev.map((e) => (e.exerciseId === currentPE.exerciseId ? { ...e, notes: note } : e))
        );
        setNote('');
      }
      nextExercise();
    }
  };

  const nextExercise = () => {
    if (currentExIndex < totalExercises - 1) {
      const nextIdx = currentExIndex + 1;
      setCurrentExIndex(nextIdx);
      setCurrentSetIndex(0);
      setMuscleRoundSet(0);
      setMuscleRoundClusters([]);
      const nextPE = day!.exercises[nextIdx];
      setWeight(nextPE.baseLoad || 0);
      setReps(nextPE.technique === 'muscle-rounds' ? 6 : nextPE.repsMin);
      setNote('');
    } else {
      finishWorkout();
    }
  };

  const skipExercise = () => {
    if (currentPE && currentEx) {
      setExerciseLogs((prev) => {
        const existing = prev.find((e) => e.exerciseId === currentPE.exerciseId);
        if (!existing) {
          return [
            ...prev,
            {
              exerciseId: currentPE.exerciseId,
              exerciseName: currentEx.name,
              sets: [],
              skipped: true,
            },
          ];
        }
        return prev;
      });
    }
    nextExercise();
  };

  const addCluster = () => {
    setClusters((prev) => [...prev, reps]);
    startRest(12);
  };

  const addDrop = () => {
    setDrops((prev) => [...prev, { weight, reps }]);
    setWeight((w) => Math.round(w * 0.7));
  };

  const finishWorkout = () => {
    if (sessionId) {
      sessionService.complete(sessionId).catch(() => {});
    }
    setShowSummary(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showSummary) {
    const totalVolume = exerciseLogs.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    );
    const duration = Math.round((Date.now() - startTime) / 60000);
    const totalSets = exerciseLogs.reduce((sum, ex) => sum + ex.sets.length, 0);
    const prCount = exerciseLogs.flatMap((e) => e.sets).filter((s) => s.isPersonalRecord).length;

    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center max-w-md mx-auto text-center space-y-6 overflow-y-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-success" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-display font-bold">Treino Completo! 🎉</h1>
        <p className="text-muted-foreground">{day?.name}</p>

        <div className="grid grid-cols-2 gap-4 w-full">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold">{duration}'</p>
              <p className="text-xs text-muted-foreground">Duração</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold">{(totalVolume / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Volume (kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold">{totalSets}</p>
              <p className="text-xs text-muted-foreground">Séries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-warning">{prCount}</p>
              <p className="text-xs text-muted-foreground">PRs</p>
            </CardContent>
          </Card>
        </div>

        <Button className="w-full touch-target" onClick={() => navigate('/')}>
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  if (!day || !currentPE || !currentEx) return null;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence>
        {showPR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <div className="bg-card p-8 rounded-2xl text-center space-y-3 glow-primary">
              <Trophy className="h-16 w-16 text-warning mx-auto animate-bounce" />
              <h2 className="text-2xl font-display font-bold">NOVO PR! 🔥</h2>
              <p className="text-muted-foreground">{currentEx.name}</p>
              <p className="text-xl font-bold text-primary">
                {weight}kg × {reps} reps
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/treino')}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">{day.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={skipExercise}
            className="text-muted-foreground"
          >
            <SkipForward className="h-4 w-4 mr-1" /> Pular
          </Button>
        </div>
        <Progress value={progress} className="h-1.5" />
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Exercício {currentExIndex + 1} de {totalExercises}
        </p>
      </div>

      {isResting && !isMuscleRoundRest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6 space-y-6"
        >
          <Timer className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-6xl font-display font-bold tabular-nums">{formatTime(restTime)}</p>
          <Progress value={((restTotal - restTime) / restTotal) * 100} className="w-48 h-2" />
          <p className="text-muted-foreground">Descansando...</p>
          <Button variant="outline" onClick={skipRest} className="touch-target">
            Pular descanso
          </Button>
        </motion.div>
      )}

      {isMuscleRoundRest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6 space-y-6"
        >
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-muted" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="8"
                className="stroke-primary"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - (restTotal - restTime) / restTotal)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-display font-bold tabular-nums">{restTime}s</span>
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-4 w-4 rounded-full transition-all',
                  i < muscleRoundSet ? 'bg-primary scale-100' : 'bg-muted scale-90'
                )}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Muscle Round — Mini-série {muscleRoundSet}/{6}
          </p>
          <Button variant="ghost" size="sm" onClick={skipRest}>
            Pular
          </Button>
        </motion.div>
      )}

      {!isResting && !isMuscleRoundRest && (
        <div className="flex-1 flex flex-col p-4 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="text-center space-y-1"
            >
              <h2 className="text-xl font-display font-bold">{currentEx.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">{TECHNIQUE_LABELS[currentPE.technique]}</Badge>
                {isMuscleRounds ? (
                  <span className="text-sm text-muted-foreground">
                    Mini-série {muscleRoundSet + 1}/6 · 6 reps
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Série {currentSetIndex + 1}/{currentPE.sets} · {currentPE.repsMin}-
                    {currentPE.repsMax} reps
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {isMuscleRounds && (
            <Card className="mx-auto w-full max-w-xs">
              <CardContent className="p-4 text-center space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Muscle Rounds
                </p>
                <div className="flex justify-center gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        scale: i === muscleRoundSet ? 1.3 : 1,
                        backgroundColor:
                          i < muscleRoundSet
                            ? 'hsl(var(--primary))'
                            : i === muscleRoundSet
                              ? 'hsl(var(--primary))'
                              : 'hsl(var(--muted))',
                      }}
                      className={cn(
                        'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold',
                        i < muscleRoundSet
                          ? 'text-primary-foreground'
                          : i === muscleRoundSet
                            ? 'text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                            : 'text-muted-foreground'
                      )}
                    >
                      {i < muscleRoundSet ? <Check className="h-3 w-3" /> : i + 1}
                    </motion.div>
                  ))}
                </div>
                <p className="text-3xl font-display font-bold">6 reps × {weight}kg</p>
              </CardContent>
            </Card>
          )}

          <Card className="mx-auto w-full max-w-xs">
            <CardContent className="p-4 text-center space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Carga (kg)</p>
              <div className="flex items-center justify-center gap-4">
                <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full text-xl touch-target"
                    onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={weight}
                    variants={popVariants}
                    initial="initial"
                    animate="animate"
                    className="text-5xl font-display font-bold tabular-nums min-w-[120px]"
                  >
                    {weight}
                  </motion.span>
                </AnimatePresence>
                <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full text-xl touch-target"
                    onClick={() => setWeight((w) => w + 2.5)}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {!isMuscleRounds && (
            <Card className="mx-auto w-full max-w-xs">
              <CardContent className="p-4 text-center space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Repetições</p>
                <div className="flex items-center justify-center gap-4">
                  <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full touch-target"
                      onClick={() => setReps((r) => Math.max(1, r - 1))}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={reps}
                      variants={popVariants}
                      initial="initial"
                      animate="animate"
                      className="text-4xl font-display font-bold tabular-nums min-w-[60px]"
                    >
                      {reps}
                    </motion.span>
                  </AnimatePresence>
                  <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full touch-target"
                      onClick={() => setReps((r) => r + 1)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentPE.technique === 'rest-pause' && clusters.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Clusters: {clusters.join(' + ')} + ...
              </p>
            </div>
          )}

          {currentPE.technique === 'drop-set' && drops.length > 0 && (
            <div className="text-center space-y-1">
              {drops.map((d, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  Drop {i + 1}: {d.weight}kg × {d.reps}
                </p>
              ))}
            </div>
          )}

          <div className="flex-1" />
          <div className="space-y-2 pb-4">
            {currentPE.technique === 'rest-pause' && (
              <Button variant="outline" className="w-full touch-target" onClick={addCluster}>
                <Plus className="h-4 w-4 mr-1" /> Cluster (+{reps} reps)
              </Button>
            )}
            {currentPE.technique === 'drop-set' && (
              <Button variant="outline" className="w-full touch-target" onClick={addDrop}>
                <Minus className="h-4 w-4 mr-1" /> Drop (reduzir carga)
              </Button>
            )}

            {showNote ? (
              <div className="flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nota rápida..."
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => setShowNote(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" className="w-full" onClick={() => setShowNote(true)}>
                <MessageSquare className="h-4 w-4 mr-1" /> Nota
              </Button>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                className="w-full touch-target text-lg font-semibold h-14 glow-primary"
                onClick={logSet}
                disabled={saving}
              >
                <Check className="h-5 w-5 mr-2" />
                {isMuscleRounds ? `Mini-série ${muscleRoundSet + 1}/6` : 'Registrar Série'}
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}