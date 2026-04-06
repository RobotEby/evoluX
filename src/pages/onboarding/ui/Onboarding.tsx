import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Brain, LayoutGrid, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../../shared/ui/ui/button';
import { Card } from '../../../shared/ui/ui/card';
import { Input } from '../../../shared/ui/ui/input';
import { cn } from '../../../shared/lib/utils';
import { saveUser, getUser } from '../../../shared/lib/storage';
import type { Goal, ExperienceLevel, DivisionType } from '../../../entities/workout/model/workout';
import { DIVISION_LABELS } from '../../../entities/workout/model/workout';

const steps = ['welcome', 'name', 'goal', 'experience', 'split'] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<Goal>('hipertrofia');
  const [experience, setExperience] = useState<ExperienceLevel>('intermediario');
  const [split, setSplit] = useState<DivisionType>('ppl');

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const finish = () => {
    const user = getUser();
    saveUser({
      ...user,
      name: name || 'Atleta',
      goal,
      experience,
      preferredSplit: split,
      onboardingComplete: true,
    });

    navigate('/dashboard', { replace: true });
  };

  const canNext = step === 0 || step === 1 || step >= 2;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          {step === 0 && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center"
              >
                <Zap className="h-10 w-10 text-primary" />
              </motion.div>
              <h1 className="text-4xl font-display font-bold tracking-tight">evoluX</h1>
              <p className="text-muted-foreground text-lg">
                Seu sistema inteligente de treino com técnicas avançadas de intensidade.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold">Como podemos te chamar?</h2>
                <p className="text-muted-foreground">Opcional — você pode alterar depois.</p>
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="text-center text-lg h-14"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Target className="h-8 w-8 text-primary mx-auto" />
                <h2 className="text-2xl font-display font-bold">Qual seu objetivo?</h2>
              </div>
              <div className="grid gap-3">
                {[
                  {
                    value: 'hipertrofia' as Goal,
                    label: 'Hipertrofia',
                    desc: 'Ganho de massa muscular',
                  },
                  {
                    value: 'forca' as Goal,
                    label: 'Força',
                    desc: 'Aumento de cargas máximas',
                  },
                ].map((opt) => (
                  <Card
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={cn(
                      'p-4 cursor-pointer transition-all touch-target',
                      goal === opt.value
                        ? 'border-primary glow-primary bg-primary/5'
                        : 'hover:border-muted-foreground/30'
                    )}
                  >
                    <p className="font-semibold">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Brain className="h-8 w-8 text-primary mx-auto" />
                <h2 className="text-2xl font-display font-bold">Nível de experiência</h2>
              </div>
              <div className="grid gap-3">
                {[
                  {
                    value: 'iniciante' as ExperienceLevel,
                    label: 'Iniciante',
                    desc: 'Menos de 1 ano treinando',
                  },
                  {
                    value: 'intermediario' as ExperienceLevel,
                    label: 'Intermediário',
                    desc: '1-3 anos de treino consistente',
                  },
                  {
                    value: 'avancado' as ExperienceLevel,
                    label: 'Avançado',
                    desc: 'Mais de 3 anos, técnicas avançadas',
                  },
                ].map((opt) => (
                  <Card
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={cn(
                      'p-4 cursor-pointer transition-all touch-target',
                      experience === opt.value
                        ? 'border-primary glow-primary bg-primary/5'
                        : 'hover:border-muted-foreground/30'
                    )}
                  >
                    <p className="font-semibold">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <LayoutGrid className="h-8 w-8 text-primary mx-auto" />
                <h2 className="text-2xl font-display font-bold">Divisão preferida</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(DIVISION_LABELS) as [DivisionType, string][]).map(
                  ([value, label]) => (
                    <Card
                      key={value}
                      onClick={() => setSplit(value)}
                      className={cn(
                        'p-3 cursor-pointer transition-all touch-target text-center',
                        split === value
                          ? 'border-primary glow-primary bg-primary/5'
                          : 'hover:border-muted-foreground/30'
                      )}
                    >
                      <p className="font-semibold text-sm">{label}</p>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-4 mt-10 w-full max-w-md">
        {step > 0 && (
          <Button variant="ghost" onClick={back} className="touch-target">
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        )}
        <div className="flex-1" />
        <Button onClick={next} className="touch-target glow-primary px-6" disabled={!canNext}>
          {step === steps.length - 1 ? 'Começar' : 'Próximo'}
          {step < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>

      <div className="flex gap-2 mt-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === step ? 'w-8 bg-primary' : 'w-1.5 bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}
