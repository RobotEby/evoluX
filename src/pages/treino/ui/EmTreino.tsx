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
} from 'lucide-react';
import { Button } from '@/shared/ui/ui/button';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Input } from '@/shared/ui/ui/input';
import { Badge } from '@/shared/ui/ui/badge';
import { Progress } from '@/shared/ui/ui/progress';
import { cn } from '@/shared/lib/utils';
import { getPlans, addSession, addPR, getSessions } from '@/shared/lib/storage';
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

const MotionButton = motion(Button);

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      console.log('Executando...');
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Muscle Rounds state
  const [muscleRoundSet, setMuscleRoundSet] = useState(0); // 0-5 (which mini-set)
  const [isMuscleRoundRest, setIsMuscleRoundRest] = useState(false);
  const [muscleRoundClusters, setMuscleRoundClusters] = useState<number[]>([]);

  useEffect(() => {
    const plans = getPlans();
    const p = plans.find((x) => x.id === planId);
    if (!p) {
      navigate('/treino');
      return;
    }
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
  }, [planId, dayId, navigate]);

  const currentPE = day?.exercises[currentExIndex];
  const currentEx = currentPE ? EXERCISES.find((e) => e.id === currentPE.exerciseId) : null;
  const totalExercises = day?.exercises.length || 0;
  const progress = totalExercises > 0 ? (currentExIndex / totalExercises) * 100 : 0;
  const isMuscleRounds = currentPE?.technique === 'muscle-rounds';

  // Rest timer (shared for normal rest and muscle round rest)
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

  // Muscle Rounds: log one mini-set, start 10s timer, advance
  const logMuscleRoundMiniSet = () => {
    if (!currentPE || !currentEx) return;
    const newClusters = [...muscleRoundClusters, 6];
    setMuscleRoundClusters(newClusters);

    if (muscleRoundSet < 5) {
      // Start 10s rest
      setMuscleRoundSet((s) => s + 1);
      setRestTotal(10);
      setRestTime(10);
      setIsMuscleRoundRest(true);
    } else {
      // All 6 done — log as single set
      const setLog: SetLog = {
        setNumber: currentSetIndex + 1,
        reps: 36, // 6x6
        weight,
        technique: 'muscle-rounds',
        clusters: newClusters,
      };

      // Check PR
      const est1RM = calculate1RM(weight, 36);
      const sessions = getSessions();
      const previousBest = sessions
        .flatMap((s) => s.exercises)
        .filter((e) => e.exerciseId === currentPE.exerciseId)
        .flatMap((e) => e.sets)
        .reduce((best, s) => {
          const e = calculate1RM(s.weight, s.reps);
          return e > best ? e : best;
        }, 0);

      if (est1RM > previousBest && weight > 0) {
        setLog.isPersonalRecord = true;
        addPR({
          exerciseId: currentPE.exerciseId,
          exerciseName: currentEx.name,
          weight,
          reps: 36,
          estimated1RM: est1RM,
          date: new Date().toISOString().split('T')[0],
        });
        setShowPR(true);
        setTimeout(() => setShowPR(false), 2500);
      }

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

      // Reset muscle round state and move to next exercise
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

    // Muscle Rounds uses its own flow
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
    const sessions = getSessions();
    const previousBest = sessions
      .flatMap((s) => s.exercises)
      .filter((e) => e.exerciseId === currentPE.exerciseId)
      .flatMap((e) => e.sets)
      .reduce((best, s) => {
        const e = calculate1RM(s.weight, s.reps);
        return e > best ? e : best;
      }, 0);

    if (est1RM > previousBest && weight > 0) {
      setLog.isPersonalRecord = true;
      addPR({
        exerciseId: currentPE.exerciseId,
        exerciseName: currentEx.name,
        weight,
        reps: setLog.reps,
        estimated1RM: est1RM,
        date: new Date().toISOString().split('T')[0],
      });
      setShowPR(true);
      setTimeout(() => setShowPR(false), 2500);
    }

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
    const totalVolume = exerciseLogs.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    );

    const session: WorkoutSession = {
      id: `sess-${Date.now()}`,
      planId: planId!,
      dayId: dayId!,
      dayName: day!.name,
      date: new Date().toISOString().split('T')[0],
      duration: Math.round((Date.now() - startTime) / 60000),
      exercises: exerciseLogs,
      totalVolume,
      completed: true,
    };

    addSession(session);
    setShowSummary(true);
  };

  if (showSummary) {
    const totalVolume = exerciseLogs.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    );
    const duration = Math.round((Date.now() - startTime) / 60000);
    const totalSets = exerciseLogs.reduce((sum, ex) => sum + ex.sets.length, 0);
    const prs = exerciseLogs.flatMap((e) => e.sets).filter((s) => s.isPersonalRecord).length;

    // Find previous session for same day
    const allSessions = getSessions();
    const previousSession = allSessions
      .filter((s) => s.planId === planId && s.dayId === dayId && s.completed)
      .sort((a, b) => b.date.localeCompare(a.date))
      .find((s) => s.id !== `sess-${startTime}`); // exclude current

    const prevVolume = previousSession?.totalVolume || 0;
    const volumeDelta = prevVolume > 0 ? totalVolume - prevVolume : null;
    const volumeDeltaPct = prevVolume > 0 ? ((totalVolume - prevVolume) / prevVolume) * 100 : null;

    // Per-exercise comparison
    const exerciseDeltas = exerciseLogs.map((ex) => {
      const prevEx = previousSession?.exercises.find((pe) => pe.exerciseId === ex.exerciseId);
      const currentMaxLoad = Math.max(...ex.sets.map((s) => s.weight), 0);
      const prevMaxLoad = prevEx ? Math.max(...prevEx.sets.map((s) => s.weight), 0) : 0;
      const currentVol = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0);
      const prevVol = prevEx ? prevEx.sets.reduce((s, set) => s + set.weight * set.reps, 0) : 0;
      return {
        name: ex.exerciseName,
        loadDelta: prevEx ? currentMaxLoad - prevMaxLoad : null,
        volDelta: prevEx ? currentVol - prevVol : null,
      };
    });

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
              {volumeDelta !== null && (
                <p
                  className={cn(
                    'text-xs font-medium mt-1',
                    volumeDelta >= 0 ? 'text-success' : 'text-destructive'
                  )}
                >
                  {volumeDelta >= 0 ? '▲' : '▼'} {Math.abs(volumeDeltaPct!).toFixed(1)}%
                </p>
              )}
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
              <p className="text-2xl font-display font-bold text-warning">{prs}</p>
              <p className="text-xs text-muted-foreground">PRs</p>
            </CardContent>
          </Card>
        </div>

        {/* Per-exercise comparison */}
        {previousSession && (
          <Card className="w-full">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                vs. Sessão Anterior
              </p>
              {exerciseDeltas.map((ex, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1 text-left">{ex.name}</span>
                  <div className="flex gap-3 shrink-0">
                    {ex.loadDelta !== null && (
                      <span
                        className={cn(
                          'tabular-nums font-medium',
                          ex.loadDelta > 0
                            ? 'text-success'
                            : ex.loadDelta < 0
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                        )}
                      >
                        {ex.loadDelta > 0 ? '+' : ''}
                        {ex.loadDelta}kg
                      </span>
                    )}
                    {ex.volDelta !== null && (
                      <span
                        className={cn(
                          'tabular-nums text-xs',
                          ex.volDelta > 0
                            ? 'text-success'
                            : ex.volDelta < 0
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                        )}
                      >
                        {ex.volDelta > 0 ? '+' : ''}
                        {ex.volDelta}vol
                      </span>
                    )}
                    {ex.loadDelta === null && (
                      <span className="text-xs text-muted-foreground">novo</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button className="w-full touch-target" onClick={() => navigate('/')}>
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  if (!day || !currentPE || !currentEx) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* PR animation */}
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

      {/* Header */}
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

      {/* Rest Timer Overlay (normal rest) */}
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

      {/* Muscle Round Rest (inline, smaller) */}
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

          {/* Mini-set dots */}
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

      {/* Main Exercise View */}
      {!isResting && !isMuscleRoundRest && (
        <div className="flex-1 flex flex-col p-4 space-y-4">
          {/* Exercise info with slide animation */}
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

          {/* Muscle Rounds: dot progress + fixed reps */}
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

          {/* Weight adjuster */}
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

          {/* Reps (hidden for muscle rounds) */}
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

          {/* Clusters for Rest-Pause */}
          {currentPE.technique === 'rest-pause' && clusters.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Clusters: {clusters.join(' + ')} + ...
              </p>
            </div>
          )}

          {/* Drops for Drop Set */}
          {currentPE.technique === 'drop-set' && drops.length > 0 && (
            <div className="text-center space-y-1">
              {drops.map((d, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  Drop {i + 1}: {d.weight}kg × {d.reps}
                </p>
              ))}
            </div>
          )}

          {/* Action buttons */}
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
