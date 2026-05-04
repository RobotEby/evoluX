import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Progress } from '@/shared/ui/ui/progress';
import { motion } from 'framer-motion';
import { checkAndUnlockAchievements } from '@/shared/lib/achievements';
import type { Achievement } from '@/entities/workout/api/body';

export default function Conquistas() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(checkAndUnlockAchievements());
  }, []);

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Conquistas
      </h1>

      <p className="text-sm text-muted-foreground">
        {unlocked.length} de {achievements.length} desbloqueadas
      </p>

      {unlocked.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-primary">🏆 Desbloqueadas</h2>
          {unlocked.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-3xl drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                    {a.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                    <Progress value={100} className="h-1.5 mt-2 [&>div]:bg-yellow-500" />
                  </div>
                  <span className="text-xs text-yellow-500 font-bold">✓</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">🔒 Bloqueadas</h2>
          {locked.map((a) => (
            <Card key={a.id} className="opacity-60">
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-3xl grayscale">{a.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={(a.progress / a.target) * 100} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {a.progress}/{a.target}
                    </span>
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
